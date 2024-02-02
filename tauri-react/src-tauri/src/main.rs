// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

use reqwest::{Client, Url, header::{ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_ALLOW_HEADERS, CONTENT_TYPE}, cookie::{CookieStore, Cookie}};
use tauri::State;

struct TauriState {
    client: Client,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(username: &str, password: &str, state: State<'_, TauriState>) ->  Result<HashMap<String, String>, String> {
    let params = [("username", &username), ("password", &password)];
    let url = Url::parse(&format!("http://localhost:8000/login")).map_err(|e| e.to_string())?;
    let res = state.client.post(url)
    .form(&params)
    .header(ACCESS_CONTROL_ALLOW_CREDENTIALS, "true")
    .header(CONTENT_TYPE, "application/x-www-form-urlencoded")
    .send()
    .await.map_err(|e| e.to_string())?;
    //.json::<HashMap<String, String>>()
    //.await.map_err(|e| e.to_string())?;
    for cookie in res.cookies() {
        println!("{:?}", cookie);
    }

    let res2 = state.client.get("http://localhost:8000/user")
        .header(ACCESS_CONTROL_ALLOW_CREDENTIALS, "true")
        .send()
        .await.map_err(|e| e.to_string())?;

    println!("{:?}", res2);


    Ok(HashMap::new())
}

fn main() {
    tauri::Builder::default()
        .manage(TauriState { client: Client::builder().cookie_store(true).build().unwrap() })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
