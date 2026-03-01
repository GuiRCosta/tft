use thiserror::Error;

#[derive(Error, Debug)]
pub enum DdragonError {
    #[error("Falha ao buscar versao do Data Dragon: {0}")]
    VersionFetchError(String),

    #[error("Falha na requisicao HTTP: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Falha ao parsear JSON: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Falha ao acessar cache no disco: {0}")]
    CacheError(String),

    #[error("Nenhum set TFT ativo encontrado nos dados")]
    NoActiveSetFound,

    #[error("Falha de IO: {0}")]
    IoError(#[from] std::io::Error),
}

impl From<DdragonError> for String {
    fn from(err: DdragonError) -> Self {
        err.to_string()
    }
}
