use std::path::PathBuf;

use reqwest::Client;

pub struct TauriState {
    pub client: Client,
    pub path: PathBuf,
}

impl TauriState {
    pub fn new(path: PathBuf) -> Self {
        Self {
            client: Client::new(),
            path,
        }
    }
}
