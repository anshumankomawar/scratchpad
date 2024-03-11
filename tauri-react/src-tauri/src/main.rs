// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate cocoa;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

#[cfg(target_os = "macos")]
mod mac;

mod error;
mod fetch;
mod state;
mod util;

use error::Result;
use fetch::document::{add_folder, get_documents, save_document, update_document};
use fetch::search::search_user_documents;
use fetch::{auth::login, user::get_user};
use state::TauriState;
use util::check;

use std::path::PathBuf;
use tauri::{App, Manager, Wry};
use tauri_plugin_store::{with_store, StoreCollection};

fn load_store(app: &mut App, path: &PathBuf) -> Result<()> {
    let stores = app.state::<StoreCollection<Wry>>();
    with_store(app.handle().clone(), stores, &path, |store| store.load())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if cfg!(target_os = "macos") {
                #[cfg(target_os = "macos")]
                use mac::window::setup_mac_window;

                #[cfg(target_os = "macos")]
                setup_mac_window(app);
            }

            let path = PathBuf::from("config.json");
            let _ = load_store(app, &path);

            app.manage(TauriState::new(path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login,
            check,
            get_user,
            search_user_documents,
            save_document,
            get_documents,
            update_document,
            add_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
