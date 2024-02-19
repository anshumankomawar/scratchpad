use reqwest::header::AUTHORIZATION;
use serde_json::{json, Value};
use serde::{Serialize, Deserialize};
use tauri::State;

use crate::state::TauriState;
use crate::{error::Result, util::get_from_store};

#[derive(Serialize, Deserialize, Debug)]
struct Reference {
    chunk_id: String,
    document_id: String,
    filename: String,
    foldername: String,
    content: String,
    similarity: f64
}

#[derive(Serialize, Deserialize, Debug)]
struct Response {
    data: String,
    references: Vec<Reference>
}

#[tauri::command]
pub async fn search_user_documents(query: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<Value> {
    let token = get_from_store(&state, &app)?;

    let res = state.client.post("http://localhost:8000/search")
    .query(&[("query", query)])
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<Response>()
    .await?;

    Ok(json!(res))
}
