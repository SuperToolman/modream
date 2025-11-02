use ignore::Walk;

/**
 * Scan all files in the specified path
 */
pub fn scan(path: &str) -> anyhow::Result<()> {
    // Use ignore library to traverse directories
    for result in Walk::new(path) {
        if let Ok(entry) = result {
            if entry.file_type().map(|ft| ft.is_file()).unwrap_or(false) {
                println!("File: {}", entry.path().display());
            }
        }
    }
    Ok(())
}

