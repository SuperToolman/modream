// 窗口控制命令
#[tauri::command]
fn minimize_window(window: tauri::Window) {
  window.minimize().unwrap();
}

#[tauri::command]
fn maximize_window(window: tauri::Window) {
  window.maximize().unwrap();
}

#[tauri::command]
fn unmaximize_window(window: tauri::Window) {
  window.unmaximize().unwrap();
}

#[tauri::command]
fn close_window(window: tauri::Window) {
  window.close().unwrap();
}

#[tauri::command]
fn is_maximized(window: tauri::Window) -> bool {
  window.is_maximized().unwrap_or(false)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      minimize_window,
      maximize_window,
      unmaximize_window,
      close_window,
      is_maximized
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
