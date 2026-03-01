use thiserror::Error;

#[derive(Error, Debug)]
pub enum MetaCompsError {
    #[error("Falha na requisicao HTTP: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Falha ao parsear JSON: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Falha ao acessar cache no disco: {0}")]
    CacheError(String),

    #[error("Falha de IO: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Nenhuma composicao encontrada nos dados")]
    EmptyCompositions,
}

impl From<MetaCompsError> for String {
    fn from(err: MetaCompsError) -> Self {
        err.to_string()
    }
}
