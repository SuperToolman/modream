use std::path::Path;

/// 章节信息
#[derive(Debug, Clone)]
pub struct ChapterInfo {
    pub path: String,
    pub title: String,
    pub chapter_number: f32,
    pub page_count: i32,
}

/// 漫画扫描结果
#[derive(Debug, Clone)]
pub enum MangaScanResult {
    /// 单文件夹漫画（直接包含图片）
    SingleFolder {
        path: String,
        page_count: i32,
    },
    /// 章节结构漫画（包含多个章节子目录）
    ChapterStructure {
        root_path: String,
        chapters: Vec<ChapterInfo>,
    },
}

/// 检查文件是否为图片
fn is_image_file(path: &Path) -> bool {
    let supported_formats = shared::config::get().server().image().supported_formats();
    
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| supported_formats.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

/// 检查目录名是否匹配章节模式，返回章节号
fn is_chapter_folder(name: &str) -> Option<f32> {
    // 尝试提取章节号的各种模式

    // 模式 1: "第X话" "第X章" "第X集" "第X卷"
    if name.starts_with("第") {
        for suffix in &["话", "章", "集", "卷"] {
            if let Some(num_str) = name.strip_prefix("第").and_then(|s| s.strip_suffix(suffix)) {
                if let Ok(num) = num_str.trim().parse::<f32>() {
                    return Some(num);
                }
            }
        }
    }

    // 模式 2: "Chapter X" "Ch. X" "Ch X"
    for prefix in &["Chapter ", "Chapter", "Ch. ", "Ch.", "Ch "] {
        if name.starts_with(prefix) {
            if let Some(num_str) = name.strip_prefix(prefix) {
                if let Ok(num) = num_str.trim().parse::<f32>() {
                    return Some(num);
                }
            }
        }
    }

    // 模式 3: "X话" "X章" (纯数字开头)
    for suffix in &["话", "章", "集", "卷"] {
        if name.ends_with(suffix) {
            if let Some(num_str) = name.strip_suffix(suffix) {
                if let Ok(num) = num_str.trim().parse::<f32>() {
                    return Some(num);
                }
            }
        }
    }

    // 模式 4: 纯数字
    if let Ok(num) = name.trim().parse::<f32>() {
        return Some(num);
    }

    None
}

/// 统计文件夹中的图片数量
fn count_images_in_folder(path: &str) -> anyhow::Result<i32> {
    let mut count = 0;
    for entry in std::fs::read_dir(path)? {
        let entry = entry?;
        if entry.path().is_file() && is_image_file(&entry.path()) {
            count += 1;
        }
    }
    Ok(count)
}

/// 扫描单个目录，判断是单文件夹漫画还是章节结构
pub fn scan_manga_folder(path: &str) -> anyhow::Result<Option<MangaScanResult>> {
    let path_obj = Path::new(path);
    if !path_obj.exists() || !path_obj.is_dir() {
        return Ok(None);
    }
    
    let mut has_images = false;
    let mut subdirs = Vec::new();
    
    // 读取目录内容
    for entry in std::fs::read_dir(path)? {
        let entry = entry?;
        let entry_path = entry.path();
        
        if entry_path.is_file() && is_image_file(&entry_path) {
            has_images = true;
        } else if entry_path.is_dir() {
            if let Some(dir_name) = entry_path.file_name().and_then(|n| n.to_str()) {
                subdirs.push((dir_name.to_string(), entry_path));
            }
        }
    }
    
    // 情况 1：直接包含图片 → 单文件夹漫画
    if has_images {
        let page_count = count_images_in_folder(path)?;
        if page_count >= 2 {
            tracing::debug!("Found single-folder manga: {} ({} pages)", path, page_count);
            return Ok(Some(MangaScanResult::SingleFolder {
                path: path.to_string(),
                page_count,
            }));
        }
        return Ok(None);
    }
    
    // 情况 2：只包含子目录，检查是否为章节结构
    if !subdirs.is_empty() {
        let mut chapters = Vec::new();
        
        for (dir_name, dir_path) in subdirs {
            // 检查是否匹配章节模式
            if let Some(chapter_num) = is_chapter_folder(&dir_name) {
                let page_count = count_images_in_folder(dir_path.to_str().unwrap())?;
                if page_count >= 2 {
                    tracing::debug!("Found chapter: {} (number: {}, {} pages)", dir_name, chapter_num, page_count);
                    chapters.push(ChapterInfo {
                        path: dir_path.to_string_lossy().to_string(),
                        title: dir_name,
                        chapter_number: chapter_num,
                        page_count,
                    });
                }
            }
        }
        
        // 如果找到至少 1 个章节，认为是章节结构
        if !chapters.is_empty() {
            // 按章节号排序
            chapters.sort_by(|a, b| a.chapter_number.partial_cmp(&b.chapter_number).unwrap());
            
            tracing::info!("Found chapter-structure manga: {} ({} chapters)", path, chapters.len());
            return Ok(Some(MangaScanResult::ChapterStructure {
                root_path: path.to_string(),
                chapters,
            }));
        }
    }
    
    Ok(None)
}

/// 扫描所有漫画文件夹（改进版，支持章节结构）
///
/// # 参数
/// - `path`: 要扫描的根路径
///
/// # 返回
/// - `anyhow::Result<Vec<MangaScanResult>>` - 扫描结果列表
///
/// # 职责
/// - ✅ 扫描文件夹，识别单文件夹漫画和章节结构漫画
/// - ✅ 自动识别章节模式（第1话、Chapter 1、Ch.1 等）
/// - ❌ 不包含业务规则验证（由领域层处理）
pub fn scan_folders_v2(path: &str) -> anyhow::Result<Vec<MangaScanResult>> {
    let mut results = Vec::new();

    // 只扫描顶层目录的直接子目录
    for entry in std::fs::read_dir(path)? {
        let entry = entry?;
        let entry_path = entry.path();

        if entry_path.is_dir() {
            let dir_path = entry_path.to_string_lossy().to_string();
            if let Some(result) = scan_manga_folder(&dir_path)? {
                results.push(result);
            }
        }
    }

    tracing::info!("Scanned {} manga folders in {}", results.len(), path);
    Ok(results)
}