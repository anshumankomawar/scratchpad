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

#[derive(Serialize, Deserialize, Debug)]
struct ResponseAddFolder {
    folder_id: Option<String>,
}

#[tauri::command]
pub async fn save_document(filename: &str, content: &str, folderId: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<String> {
    let params = [("filename", &filename), ("content", &content), ("folder_id", &folderId)];
    let token = get_from_store(&state, &app)?;

    let res = state.client.post("http://localhost:8000/documentV2")
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

#[tauri::command]
pub async fn delete_document(fileId: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<()> {
    let token = get_from_store(&state, &app)?;

    let res = state.client.delete("http://localhost:8000/document")
    .query(&[("id", fileId)])
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?;

    Ok(())
}

#[tauri::command]
pub async fn add_folder(foldername: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<String> {
    let params = [("foldername", &foldername), ("icon", &"icon")];
    let token = get_from_store(&state, &app)?;

    let res = state.client.post("http://localhost:8000/folders")
    .json(&params)
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<ResponseAddFolder>()
    .await?;

    match res.folder_id {
        Some(folder_id) => Ok(folder_id),
        None => Err(Error::SaveError("Couldn't save document".to_string()))
    }
}

#[tauri::command]
pub async fn update_document(filename: &str, content: &str, folderId: &str, currId: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<String> {
    let params = [("filename", &filename), ("content", &content), ("folder_id", &folderId), ("id", &currId)];
    let token = get_from_store(&state, &app)?;

    let res = state.client.patch("http://localhost:8000/document")
    .json(&params)
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .send()
    .await?
    .json::<ResponseSaveDocument>()
    .await?;

    match res.doc_id {
        Some(doc_id) => Ok(doc_id),
        None => Err(Error::SaveError("Couldn't update document".to_string()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Document {
    id: String,
    email: String,
    content: String,
    filename: String,
    generated: bool,
    foldername: String,
    folder_id: String,
    created_at: Option<String>, // Assuming this can be null in JSON, use Option<>
    isActive: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct Folder {
    documents: Vec<Document>,
    id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResponseGetDocuments {
    folders: HashMap<String, Folder>,
}

#[tauri::command]
pub async fn get_documents(state: tauri::State<'_, TauriState>, app: tauri::AppHandle) -> Result<ResponseGetDocuments> {
    let token = get_from_store(&state, &app)?;

    let res = state.client.get("http://localhost:8000/documentsV2")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await?
        .json::<ResponseGetDocuments>()
        .await?;

    Ok(res)
}


