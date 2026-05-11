use std::fs;
use std::path::PathBuf;

use tauri::command;

#[command]
pub fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[command]
pub fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[command]
pub fn write_binary_file(path: String, content: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[command]
pub fn list_files(path: String) -> Result<Vec<String>, String> {
    let base = PathBuf::from(&path);
    let mut results = Vec::new();
    collect_files(&base, &base, &mut results)
        .map_err(|e| format!("Failed to list {}: {}", path, e))?;
    Ok(results)
}

fn collect_files(
    base: &PathBuf,
    dir: &PathBuf,
    results: &mut Vec<String>,
) -> Result<(), std::io::Error> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let entry_path = entry.path();
        if entry_path.is_dir() {
            collect_files(base, &entry_path, results)?;
        } else {
            let relative = entry_path
                .strip_prefix(base)
                .unwrap_or(&entry_path)
                .to_string_lossy()
                .replace('\\', "/");
            results.push(relative);
        }
    }
    Ok(())
}
