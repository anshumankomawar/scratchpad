use std::collections::HashMap;
use reqwest::header::AUTHORIZATION;

use serde_json::json;
use tauri::{State, Wry, Manager};
use tauri_plugin_store::{StoreCollection, with_store};

use crate::state::TauriState;
use crate::util::get_from_store;
use crate::error::{Result, Error};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct ResponseSaveDocument {
    doc_id: Option<String>,
}

#[tauri::command]
pub async fn save_document(filename: &str, content: &str, foldername: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<String> {
    let params = [("filename", &filename), ("content", &content), ("foldername", &foldername)];
    let token = get_from_store(&state, &app)?;

    let res = state.client.post("http://localhost:8000/document")
    .json(&params)
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<ResponseSaveDocument>()
    .await?;

    match res.doc_id {
        Some(doc_id) => Ok(doc_id),
        None => Err(Error::SaveError("Couldn't save document".to_string()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Document {
    id: String,
    email: String,
    content: String,
    filename: String, 
    generated: bool,
    foldername: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResponseGetDocuments {
    documents: HashMap<String, Vec<Document>>,
}

#[tauri::command]
pub async fn get_documents(state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<ResponseGetDocuments> {
    let token = get_from_store(&state, &app)?;

    let res = state.client.get("http://localhost:8000/documents")
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<ResponseGetDocuments>()
    .await?;

    Ok(res)
}
