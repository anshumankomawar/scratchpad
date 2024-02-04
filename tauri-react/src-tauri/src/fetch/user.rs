use std::collections::HashMap;

use reqwest::header::AUTHORIZATION;
use serde_json::{json, Value};
use tauri::State;

use crate::state::TauriState;
use crate::{error::{Result, Error}, util::get_from_store};

#[tauri::command]
pub async fn get_user(state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<Value> {
    let token = get_from_store(&state, &app)?;

    let res = state.client.get("http://localhost:8000/user")
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<HashMap<String, String>>()
    .await?;

    Ok(json!(res))
}
