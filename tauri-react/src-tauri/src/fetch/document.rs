use std::collections::HashMap;

use serde_json::json;
use tauri::{State, Wry, Manager};
use tauri_plugin_store::{StoreCollection, with_store};

use crate::state::TauriState;
use crate::error::{Result, Error};

#[tauri::command]
pub async fn save_document(username: &str, password: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<()> {
    let params = [("username", &username), ("password", &password)];
    let res = state.client.post("http://localhost:8000/login")
    .form(&params)
    .send()
    .await?
    .json::<HashMap<String, String>>()
    .await?;

    let token = res.get("access_token").ok_or_else(|| Error::AuthError("token not found".into()))?;

    let stores = app.state::<StoreCollection<Wry>>();
    let _ = with_store(app.app_handle().clone(), stores, &state.path, |store| {
        store.insert("token".to_string(), json!(token))?;
        store.save()?;
        Ok(())
    })?;

    Ok(())
}
