use std::process::Command;

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

// 启动游戏命令
#[tauri::command]
fn launch_game(game_path: String) -> Result<String, String> {
  #[cfg(target_os = "windows")]
  {
    Command::new("cmd")
      .args(&["/C", "start", "", &game_path])
      .spawn()
      .map_err(|e| format!("Failed to launch game: {}", e))?;
  }

  #[cfg(target_os = "macos")]
  {
    Command::new("open")
      .arg(&game_path)
      .spawn()
      .map_err(|e| format!("Failed to launch game: {}", e))?;
  }

  #[cfg(target_os = "linux")]
  {
    Command::new("xdg-open")
      .arg(&game_path)
      .spawn()
      .map_err(|e| format!("Failed to launch game: {}", e))?;
  }

  Ok(format!("Game launched: {}", game_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      minimize_window,
      maximize_window,
      unmaximize_window,
      close_window,
      is_maximized,
      launch_game
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
