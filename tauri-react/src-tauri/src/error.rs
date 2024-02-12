use std::fmt::Display;

pub type Result<T> = core::result::Result<T, Error>;

/*
 * `Error` represents the custom error type for this module, encompassing various error scenarios.
 *
 * Variants:
 * - `StoreError`: Represents an error related to tauri plugin store.
 *      - `error` [jsonwebtoken::errors::Error]: The underlying JSON Web Token (JWT) error.
 */
#[derive(Debug)]
pub enum Error {
    ReqwestError(reqwest::Error),
    StoreError(tauri_plugin_store::Error),
    AuthError(String),
    SaveError(String)
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::ReqwestError(e) => write!(f, "ReqwestError: {}", e),
            Error::StoreError(e) => write!(f, "StoreError: {}", e),
            Error::AuthError(e) => write!(f, "AuthError: {}", e),
            Error::SaveError(e) => write!(f, "SaveError: {}", e)
        }
    }
}

impl Error {
    #[must_use]
    pub const fn code(&self) -> &'static str {
        match self {
            Error::ReqwestError(_) => "ReqwestError",
            Error::StoreError(_) => "StoreError",
            Error::AuthError(_) => "AuthError",
            Error::SaveError(_) => "SaveError"
        }
    }
}

impl From<reqwest::Error> for Error {
    fn from(error: reqwest::Error) -> Self {
        Error::ReqwestError(error)
    }
}

impl From<tauri_plugin_store::Error> for Error {
    fn from(error: tauri_plugin_store::Error) -> Self {
        Error::StoreError(error)
    }
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> core::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        use serde::ser::SerializeStruct;

        let mut state = serializer.serialize_struct("Error", 2)?;
        state.serialize_field("code", &self.code())?;
        state.serialize_field("description", &self.to_string())?;
        state.end()
    }
}
