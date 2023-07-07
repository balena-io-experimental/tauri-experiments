// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  Manager,
};

use runas::Command as RunAsCommand;
use std::process::Command;

#[tauri::command]
async fn start_backend(privileged: bool, handle: tauri::AppHandle) {
  println!("Will start backend now! privileged? {}", privileged.to_string());

  let flasher_path = handle.path_resolver()
    .resolve_resource("app")
    .expect("failed to resolve resource");

  let status;

  if privileged {
    println!("Will run as privileged");
  
    status = RunAsCommand::new(flasher_path)
    .arg("--websockets")
    .arg("--privileged")
    .gui(true)
    .status()
    .expect("Failed to execute");

  } else {
    status = Command::new(flasher_path)
      .arg("--websockets")
      // .output()
      .status()
      .expect("Failed to execute");
  }
  

  println!("{}", status.to_string());
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
        #[cfg(debug_assertions)] // only include this code on debug builds
        {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
        }
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![start_backend])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
