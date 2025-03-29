#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_devtools])
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

#[tauri::command]  // debug环境按f12打开devtool
fn open_devtools(window: tauri::WebviewWindow) {
  if cfg!(debug_assertions) {
    if window.is_devtools_open() {
      window.close_devtools();
    }
    else {
      window.open_devtools();
    }
  }
}
