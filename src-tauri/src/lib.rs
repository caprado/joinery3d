pub mod commands;
pub mod schema;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_text_file,
            commands::write_text_file,
            commands::read_binary_file,
            commands::write_binary_file,
            commands::list_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
