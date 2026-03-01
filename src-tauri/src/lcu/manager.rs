use std::sync::Arc;
use std::time::Duration;

use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Emitter;
use tokio::sync::Mutex;

use super::client::LcuRestClient;
use super::credentials;
use super::error::LcuError;
use super::events::{
    ConnectionStatusPayload, GameflowPayload, LcuErrorPayload, EVENT_CONNECTION_STATUS,
    EVENT_ERROR, EVENT_GAMEFLOW_UPDATE,
};
use super::game_tracker::GameTracker;
use super::lockfile;
use super::websocket::LcuWebSocket;

const MAX_BACKOFF_SECS: u64 = 30;
const INITIAL_BACKOFF_SECS: u64 = 1;
const GAMEFLOW_EVENT: &str = "OnJsonApiEvent_lol-gameflow_v1_gameflow-phase";

pub struct LcuState {
    pub status: Arc<Mutex<ConnectionStatusPayload>>,
}

impl Default for LcuState {
    fn default() -> Self {
        Self {
            status: Arc::new(Mutex::new(ConnectionStatusPayload::default())),
        }
    }
}

pub async fn run(app: tauri::AppHandle, state: Arc<Mutex<ConnectionStatusPayload>>) {
    let mut backoff = INITIAL_BACKOFF_SECS;

    loop {
        emit_status(&app, &state, "connecting", None, None).await;

        match try_connect(&app, &state).await {
            Ok((rest_client, _summoner_name)) => {
                backoff = INITIAL_BACKOFF_SECS;
                run_event_loop(&app, &state, &rest_client).await;
                emit_status(&app, &state, "disconnected", None, None).await;
            }
            Err(err) => {
                emit_error(&app, &err.to_string(), true);
                emit_status(&app, &state, "disconnected", None, None).await;
            }
        }

        tokio::time::sleep(Duration::from_secs(backoff)).await;
        backoff = (backoff * 2).min(MAX_BACKOFF_SECS);
    }
}

async fn try_connect(
    app: &tauri::AppHandle,
    state: &Arc<Mutex<ConnectionStatusPayload>>,
) -> Result<(LcuRestClient, Option<String>), LcuError> {
    // Tentar obter credenciais via lockfile ou processo
    let creds = credentials::get_credentials()?;
    let rest_client = LcuRestClient::new(creds.port, creds.auth_header.clone())?;

    // Verificar conexao buscando summoner
    let summoner_name = rest_client.get_current_summoner().await?;

    emit_status(
        app,
        state,
        "connected",
        summoner_name.clone(),
        Some(creds.port),
    )
    .await;

    Ok((rest_client, summoner_name))
}

async fn run_event_loop(
    app: &tauri::AppHandle,
    _state: &Arc<Mutex<ConnectionStatusPayload>>,
    rest_client: &LcuRestClient,
) {
    // Obter credenciais novamente para o WebSocket
    let creds = match credentials::get_credentials() {
        Ok(c) => c,
        Err(_) => return,
    };

    // Conectar WebSocket
    let mut ws = match LcuWebSocket::connect(creds.port, &creds.auth_header).await {
        Ok(ws) => ws,
        Err(err) => {
            emit_error(app, &err.to_string(), true);
            return;
        }
    };

    // Subscrever a eventos de gameflow
    if let Err(err) = ws.subscribe(GAMEFLOW_EVENT).await {
        emit_error(app, &err.to_string(), true);
        return;
    }

    // Game tracker para ciclo de vida da partida
    let mut game_tracker = GameTracker::new();

    // Buscar fase inicial
    if let Ok(phase) = rest_client.get_gameflow_phase().await {
        let (is_tft, queue_id) = rest_client.is_tft_lobby().await.unwrap_or((false, None));
        emit_gameflow(app, &phase, is_tft, queue_id);
        game_tracker
            .handle_phase_change(app, &phase, is_tft, rest_client)
            .await;
    }

    // Loop de eventos WebSocket
    while let Some(event) = ws.next_event().await {
        if event.uri.contains("gameflow-phase") {
            let phase = event
                .data
                .get("data")
                .and_then(|v| v.as_str())
                .unwrap_or("None")
                .to_string();

            // Verificar se e TFT quando entra em lobby ou jogo
            let (is_tft, queue_id) = if phase == "Lobby" || phase == "ChampSelect" || phase == "InProgress" {
                rest_client.is_tft_lobby().await.unwrap_or((false, None))
            } else {
                (false, None)
            };

            emit_gameflow(app, &phase, is_tft, queue_id);
            game_tracker
                .handle_phase_change(app, &phase, is_tft, rest_client)
                .await;
        }
    }
}

async fn emit_status(
    app: &tauri::AppHandle,
    state: &Arc<Mutex<ConnectionStatusPayload>>,
    status: &str,
    summoner_name: Option<String>,
    port: Option<u16>,
) {
    let payload = ConnectionStatusPayload {
        status: status.to_string(),
        summoner_name,
        port,
    };

    {
        let mut locked = state.lock().await;
        *locked = payload.clone();
    }

    app.emit(EVENT_CONNECTION_STATUS, &payload).ok();
}

fn emit_gameflow(app: &tauri::AppHandle, phase: &str, is_tft: bool, queue_id: Option<i32>) {
    let payload = GameflowPayload {
        phase: phase.to_string(),
        is_tft,
        queue_id,
    };
    app.emit(EVENT_GAMEFLOW_UPDATE, &payload).ok();
}

fn emit_error(app: &tauri::AppHandle, message: &str, recoverable: bool) {
    let payload = LcuErrorPayload {
        message: message.to_string(),
        recoverable,
    };
    app.emit(EVENT_ERROR, &payload).ok();
}

/// Inicia file watcher para detectar criacao/remocao do lockfile
pub fn start_lockfile_watcher(
    app: tauri::AppHandle,
    state: Arc<Mutex<ConnectionStatusPayload>>,
) -> Option<RecommendedWatcher> {
    let watch_dir = lockfile::get_lockfile_watch_dir()?;

    let app_clone = app.clone();
    let state_clone = state.clone();

    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            let is_lockfile = event
                .paths
                .iter()
                .any(|p| p.file_name().map(|n| n == "lockfile").unwrap_or(false));

            if !is_lockfile {
                return;
            }

            match event.kind {
                EventKind::Create(_) | EventKind::Modify(_) => {
                    let app = app_clone.clone();
                    let state = state_clone.clone();
                    tauri::async_runtime::spawn(async move {
                        // Pequeno delay para garantir que o lockfile foi escrito
                        tokio::time::sleep(Duration::from_millis(500)).await;
                        run(app, state).await;
                    });
                }
                _ => {}
            }
        }
    })
    .ok()?;

    watcher.watch(&watch_dir, RecursiveMode::NonRecursive).ok()?;

    Some(watcher)
}
