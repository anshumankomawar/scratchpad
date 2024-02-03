// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, collections::HashMap};
use tauri::{Wry, AppHandle};
use tauri_plugin_store::{with_store, StoreCollection};
use reqwest::Client;
use serde_json::json;
use tauri::{State, Manager};

struct TauriState {
    client: Client,
    path: PathBuf 
}

impl TauriState {
    fn new(path: PathBuf) -> Self {
        Self {
            client: Client::new(),
            path
        }
    }
}

#[tauri::command]
async fn login(username: &str, password: &str, state: State<'_, TauriState>, app: tauri::AppHandle) -> Result<(), String> {
    let params = [("username", &username), ("password", &password)];
    let res = state.client.post("http://localhost:8000/login")
    .form(&params)
    .send()
    .await.map_err(|e| e.to_string())?
    .json::<HashMap<String, String>>()
    .await.map_err(|e| e.to_string())?;

    let token = res.get("access_token").ok_or("response missing token")?;

    let stores = app.state::<StoreCollection<Wry>>();
    let _ = with_store(app.app_handle(), stores, &state.path, |store| {
        store.insert("token".to_string(), json!(token))?;
        store.save()?;
        Ok(())
    }).map_err(|e| e.to_string());

    Ok(())
}

#[tauri::command]
async fn check(state: State<'_, TauriState>, app: AppHandle) ->  Result<Option<String>, String> {
    let stores = app.state::<StoreCollection<Wry>>();
    with_store(app.app_handle(), stores, &state.path, |store| match store.get("token") {
        Some(token) => Ok(Some(token.to_string())),
        None => Ok(None)
    }).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // load local store
            let stores = app.state::<StoreCollection<Wry>>();
            let path = PathBuf::from("config.json");
            let _ = with_store(app.handle(), stores, &path, |store| store.load()).map_err(|e| e.to_string());

            // setup state
            app.manage(TauriState::new(path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![login, check])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
