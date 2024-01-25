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

#[cfg(target_os = "windows")]
mod win;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
        if cfg!(target_os = "macos") {
            #[cfg(target_os = "macos")]
            use mac::window::setup_mac_window;

            #[cfg(target_os = "macos")]
            setup_mac_window(app);
        } else if cfg!(target_os = "windows") {
            #[cfg(target_os = "windows")]
            use win::window::setup_win_window;

            #[cfg(target_os = "windows")]
            setup_win_window(app);
        }

        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
