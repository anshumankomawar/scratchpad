use tauri::{State, AppHandle, Wry, Manager};
use tauri_plugin_store::{StoreCollection, with_store};

use crate::state::TauriState;
use crate::error::{Result, Error};

#[tauri::command]
pub async fn check(state: State<'_, TauriState>, app: AppHandle) ->  Result<Option<String>> {
    let stores = app.state::<StoreCollection<Wry>>();
    Ok(with_store(app.app_handle().clone(), stores, &state.path, |store| match store.get("token") {
        Some(token) => Ok(Some(token.to_string())),
        None => Ok(None)
    })?)
}

pub fn get_from_store(state: &State<'_, TauriState>, app: &AppHandle) ->  Result<String> {
    let stores = app.state::<StoreCollection<Wry>>();
    match with_store(app.app_handle().clone(), stores, &state.path, |store| {
        Ok(store.get("token") .and_then(|value| value.as_str().map(String::from)))
    })? {
        Some(token) => Ok(token),
        None => Err(Error::AuthError("token not found".into()))
    }
}
