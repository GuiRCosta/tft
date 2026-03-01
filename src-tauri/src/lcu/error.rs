use thiserror::Error;

#[derive(Error, Debug)]
pub enum LcuError {
    #[error("League Client nao encontrado")]
    ClientNotFound,

    #[error("Lockfile nao encontrado")]
    LockfileNotFound,

    #[error("Formato do lockfile invalido: {raw}")]
    LockfileParseError { raw: String },

    #[error("Falha na conexao REST: {0}")]
    RestError(#[from] reqwest::Error),

    #[error("Falha na conexao WebSocket: {0}")]
    WebSocketError(String),

    #[error("Falha no file watcher: {0}")]
    WatcherError(String),

    #[error("Processo LeagueClientUx nao encontrado")]
    ProcessNotFound,
}

impl From<LcuError> for String {
    fn from(err: LcuError) -> Self {
        err.to_string()
    }
}
