mod ddragon;
mod lcu;
mod metacomps;

use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Shortcut};

use ddragon::{DdragonState, TftChampion, TftItem, TftTrait};
use lcu::{ConnectionStatusPayload, LcuState};
use metacomps::{MetaCompsState, RawMetaComp};

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn toggle_overlay(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if overlay.is_visible().unwrap_or(false) {
            overlay.hide().map_err(|e| e.to_string())?;
        } else {
            overlay.show().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn show_overlay(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if !overlay.is_visible().unwrap_or(true) {
            overlay.show().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn hide_overlay(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if overlay.is_visible().unwrap_or(false) {
            overlay.hide().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn is_overlay_visible(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        Ok(overlay.is_visible().unwrap_or(false))
    } else {
        Ok(false)
    }
}

// --- LCU Commands ---

#[tauri::command]
async fn get_lcu_status(
    state: tauri::State<'_, LcuState>,
) -> Result<ConnectionStatusPayload, String> {
    let locked = state.status.lock().await;
    Ok(locked.clone())
}

#[tauri::command]
async fn reconnect_lcu(
    app: tauri::AppHandle,
    state: tauri::State<'_, LcuState>,
) -> Result<(), String> {
    let status_arc = state.status.clone();
    tauri::async_runtime::spawn(async move {
        lcu::manager::run(app, status_arc).await;
    });
    Ok(())
}

// --- Data Dragon Commands ---

fn locale_to_ddragon(locale: &str) -> String {
    locale.replace('-', "_")
}

#[tauri::command]
async fn get_ddragon_champions(
    locale: String,
    state: tauri::State<'_, DdragonState>,
) -> Result<Vec<TftChampion>, String> {
    let ddragon_locale = locale_to_ddragon(&locale);
    let locked = state.data.lock().await;
    locked
        .get(&ddragon_locale)
        .map(|d| d.champions.clone())
        .ok_or_else(|| "Dados DDragon nao disponiveis para esse locale".to_string())
}

#[tauri::command]
async fn get_ddragon_items(
    locale: String,
    state: tauri::State<'_, DdragonState>,
) -> Result<Vec<TftItem>, String> {
    let ddragon_locale = locale_to_ddragon(&locale);
    let locked = state.data.lock().await;
    locked
        .get(&ddragon_locale)
        .map(|d| d.items.clone())
        .ok_or_else(|| "Dados DDragon nao disponiveis para esse locale".to_string())
}

#[tauri::command]
async fn get_ddragon_traits(
    locale: String,
    state: tauri::State<'_, DdragonState>,
) -> Result<Vec<TftTrait>, String> {
    let ddragon_locale = locale_to_ddragon(&locale);
    let locked = state.data.lock().await;
    locked
        .get(&ddragon_locale)
        .map(|d| d.traits.clone())
        .ok_or_else(|| "Dados DDragon nao disponiveis para esse locale".to_string())
}

#[tauri::command]
async fn get_ddragon_version(
    state: tauri::State<'_, DdragonState>,
) -> Result<String, String> {
    let locked = state.meta.lock().await;
    locked
        .as_ref()
        .map(|m| m.version.clone())
        .ok_or_else(|| "Versao DDragon nao disponivel".to_string())
}

#[tauri::command]
async fn refresh_ddragon(
    app: tauri::AppHandle,
    state: tauri::State<'_, DdragonState>,
) -> Result<(), String> {
    let data_arc = state.data.clone();
    let meta_arc = state.meta.clone();
    tauri::async_runtime::spawn(async move {
        ddragon::manager::initialize(app, data_arc, meta_arc).await;
    });
    Ok(())
}

// --- Meta Comps Commands ---

#[tauri::command]
async fn get_meta_comps(
    state: tauri::State<'_, MetaCompsState>,
) -> Result<Vec<RawMetaComp>, String> {
    let locked = state.data.lock().await;
    locked
        .as_ref()
        .map(|r| r.compositions.clone())
        .ok_or_else(|| "Meta comps nao disponiveis".to_string())
}

#[tauri::command]
async fn get_meta_comps_version(
    state: tauri::State<'_, MetaCompsState>,
) -> Result<String, String> {
    let locked = state.meta.lock().await;
    locked
        .as_ref()
        .map(|m| m.version.clone())
        .ok_or_else(|| "Versao meta comps nao disponivel".to_string())
}

#[tauri::command]
async fn refresh_meta_comps(
    app: tauri::AppHandle,
    state: tauri::State<'_, MetaCompsState>,
) -> Result<(), String> {
    let data_arc = state.data.clone();
    let meta_arc = state.meta.clone();
    tauri::async_runtime::spawn(async move {
        metacomps::manager::initialize(app, data_arc, meta_arc).await;
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            toggle_overlay,
            show_overlay,
            hide_overlay,
            is_overlay_visible,
            get_lcu_status,
            reconnect_lcu,
            get_ddragon_champions,
            get_ddragon_items,
            get_ddragon_traits,
            get_ddragon_version,
            refresh_ddragon,
            get_meta_comps,
            get_meta_comps_version,
            refresh_meta_comps,
        ])
        .manage(LcuState::default())
        .manage(DdragonState::default())
        .manage(MetaCompsState::default())
        .setup(|app| {
            if let Some(overlay) = app.get_webview_window("overlay") {
                overlay.set_ignore_cursor_events(true).ok();
            }

            // Iniciar LCU manager em background
            let app_handle = app.handle().clone();
            let lcu_state = app.state::<LcuState>();
            let status_arc = lcu_state.status.clone();

            let _watcher = lcu::manager::start_lockfile_watcher(
                app_handle.clone(),
                status_arc.clone(),
            );

            tauri::async_runtime::spawn(async move {
                lcu::manager::run(app_handle, status_arc).await;
            });

            // Iniciar Data Dragon em background
            let app_handle2 = app.handle().clone();
            let ddragon_state = app.state::<DdragonState>();
            let data_arc = ddragon_state.data.clone();
            let meta_arc = ddragon_state.meta.clone();
            let data_arc2 = data_arc.clone();
            let meta_arc2 = meta_arc.clone();

            tauri::async_runtime::spawn(async move {
                ddragon::manager::initialize(app_handle2.clone(), data_arc, meta_arc).await;
                ddragon::manager::update_check_loop(app_handle2, data_arc2, meta_arc2).await;
            });

            // Iniciar Meta Comps em background
            let app_handle_mc = app.handle().clone();
            let mc_state = app.state::<MetaCompsState>();
            let mc_data = mc_state.data.clone();
            let mc_meta = mc_state.meta.clone();
            let mc_data2 = mc_data.clone();
            let mc_meta2 = mc_meta.clone();

            tauri::async_runtime::spawn(async move {
                metacomps::manager::initialize(app_handle_mc.clone(), mc_data, mc_meta).await;
                metacomps::manager::update_check_loop(app_handle_mc, mc_data2, mc_meta2).await;
            });

            // Registrar atalhos globais para controle de nivel
            let shortcut_increment = Shortcut::new(None, Code::BracketRight);
            let shortcut_decrement = Shortcut::new(None, Code::BracketLeft);
            let app_handle3 = app.handle().clone();

            app.global_shortcut().on_shortcut(shortcut_increment, {
                let handle = app_handle3.clone();
                move |_app, _shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let _ = handle.emit("player:level-increment", ());
                    }
                }
            })?;

            app.global_shortcut().on_shortcut(shortcut_decrement, {
                let handle = app_handle3;
                move |_app, _shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let _ = handle.emit("player:level-decrement", ());
                    }
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar aplicacao");
}
