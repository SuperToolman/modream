use ignore::Walk;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Video file extensions
const VIDEO_EXTENSIONS: &[&str] = &[
    "mp4", "avi", "mkv", "mov", "flv", "wmv", "webm", "m4v", "mpg", "mpeg", "3gp", "ts", "m2ts",
];

/**
 * Check if a file is a video file
 */
fn is_video_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

/**
 * Scan all video folders in the specified path
 * Logic: folders with 2 or more videos
 * Returns: Vec<String> containing video folder paths
 */
pub fn scan_by_video(path: &str) -> anyhow::Result<Vec<String>> {
    let mut video_folders: HashMap<PathBuf, usize> = HashMap::new();

    // Use ignore library to traverse directories
    for result in Walk::new(path) {
        if let Ok(entry) = result {
            if entry.file_type().map(|ft| ft.is_file()).unwrap_or(false) {
                let file_path = entry.path();

                // Check if it's a video file
                if is_video_file(file_path) {
                    // Get the parent directory of the video file
                    if let Some(parent) = file_path.parent() {
                        *video_folders.entry(parent.to_path_buf()).or_insert(0) += 1;
                    }
                }
            }
        }
    }

    // Filter folders with 2 or more videos
    let result: Vec<String> = video_folders
        .into_iter()
        .filter(|(_, count)| *count >= 2)
        .map(|(path, _)| path.to_string_lossy().to_string())
        .collect();

    Ok(result)
}

