// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod error;
mod fetch;
mod state;
mod util;

use error::Result; 
use fetch::{auth::login, user::get_user};
use state::TauriState;
use util::check;

use std::path::PathBuf;
use tauri_plugin_store::{with_store, StoreCollection};
use tauri::{Manager, Wry, App};

fn load_store(app: &mut App, path: &PathBuf) -> Result<()> {
    let stores = app.state::<StoreCollection<Wry>>();
    with_store(app.handle(), stores, &path, |store| store.load())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let path = PathBuf::from("config.json");
            let _ = load_store(app, &path);

            app.manage(TauriState::new(path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![login, check, get_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
