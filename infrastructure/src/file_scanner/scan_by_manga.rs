use ignore::Walk;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/**
 * Check if a file is an image file
 * Uses the supported formats from the shared config
 */
fn is_image_file(path: &Path) -> bool {
    // Get supported formats from config
    let supported_formats = shared::config::get().server().image().supported_formats();

    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| supported_formats.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

/**
 * Scan all folders in the specified path and count images
 *
 * ✅ 职责：只负责扫描文件夹，统计图片数量（技术实现）
 * ❌ 不包含业务规则（如"2 张图片以上才算漫画"）
 *
 * Returns: Vec<(String, i32)> containing (folder_path, image_count) tuples
 */
pub fn scan_folders(path: &str) -> anyhow::Result<Vec<(String, i32)>> {
    let mut folders: HashMap<PathBuf, usize> = HashMap::new();

    // Use ignore library to traverse directories
    for result in Walk::new(path) {
        if let Ok(entry) = result {
            if entry.file_type().map(|ft| ft.is_file()).unwrap_or(false) {
                let file_path = entry.path();

                // Check if it's an image file
                if is_image_file(file_path) {
                    // Get the parent directory of the image file
                    if let Some(parent) = file_path.parent() {
                        *folders.entry(parent.to_path_buf()).or_insert(0) += 1;
                    }
                }
            }
        }
    }

    // ✅ 返回所有文件夹，不过滤（业务规则由领域层处理）
    let result: Vec<(String, i32)> = folders
        .into_iter()
        .map(|(path, count)| (path.to_string_lossy().to_string(), count as i32))
        .collect();

    Ok(result)
}

