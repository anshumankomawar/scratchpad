use tauri::{State, AppHandle, Wry, Manager};
use tauri_plugin_store::{StoreCollection, with_store};

use crate::state::TauriState;
use crate::error::Result;

#[tauri::command]
pub async fn check(state: State<'_, TauriState>, app: AppHandle) ->  Result<Option<String>> {
    let stores = app.state::<StoreCollection<Wry>>();
    Ok(with_store(app.app_handle(), stores, &state.path, |store| match store.get("token") {
        Some(token) => Ok(Some(token.to_string())),
        None => Ok(None)
    })?)
}

