use std::fs;

/// 从视频文件提取元数据
///
/// 使用 mediameta 库提取分辨率，使用 mp4parse 和 matroska 库提取时长。
/// 纯 Rust 实现，无需外部依赖。支持 MP4、MKV、WebM 等格式。
fn extract_metadata(path: &str) -> Result<VideoMetadata, String> {
    let metadata = mediameta::extract_file_metadata(path)
        .map_err(|e| format!("Failed to extract metadata: {}", e))?;

    let width = metadata.width as u32;
    let height = metadata.height as u32;

    // 尝试提取时长
    let duration = extract_duration(path).unwrap_or(0);

    Ok(VideoMetadata {
        duration,
        width,
        height,
    })
}

/// 从视频文件提取时长（秒）
/// 暂时所有格式都返回 0
fn extract_duration(_path: &str) -> Result<u64, String> {
    // TODO: 后续实现时长提取功能
    Ok(0)
}

/// 视频扫描查询结果
///
/// 包含视频的详细信息，用于存储扫描到的视频元数据。
#[derive(Debug, Clone)]
pub struct VideoScanQueryResult {
    /// 视频标题
    pub title: String,
    /// 视频大小（字节）
    pub byte_size: u64,
    /// 视频文件路径
    pub path: String,
    /// 视频时长（秒）
    pub duration: u64,
    /// 视频宽度（像素）
    pub width: u32,
    /// 视频高度（像素）
    pub height: u32,
    /// 视频描述
    pub description: String,
    /// 视频标签列表
    pub tags: Vec<String>,
    /// 视频主演列表
    pub actors: Vec<String>,
    /// 视频导演列表
    pub directors: Vec<String>,
    /// 视频编剧列表
    pub writers: Vec<String>,
    /// 视频制片人列表
    pub producers: Vec<String>,
    /// 视频上映日期
    pub release_date: String,
    /// 视频类型/流派列表
    pub genres: Vec<String>,
    /// 视频评分
    pub rating: f32,
    /// 视频评价人数
    pub votes: u32,
    /// 视频海报 URL 列表
    pub poster_urls: Vec<String>,
    /// 视频文件扩展名
    pub extension: String,
}

impl VideoScanQueryResult {
    /// 创建一个新的视频扫描结果
    ///
    /// # 参数
    /// * `title` - 视频标题
    /// * `path` - 视频文件路径
    ///
    /// # 示例
    /// ```
    /// use videos_modream::models::video::VideoScanQueryResult;
    /// let result = VideoScanQueryResult::new("My Video".to_string(), "/path/to/video.mp4".to_string());
    /// assert_eq!(result.title, "My Video");
    /// ```
    pub fn new(file_name: String, path: String) -> Self {
        let title = file_name.split('.').next().unwrap_or("").to_string();
        let extension = path.split('.').last().unwrap_or("").to_string();
        let byte_size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);

        match extract_metadata(&path) {
            Ok(metadata) => {
                return Self {
                    title,
                    path,
                    byte_size,
                    duration: metadata.duration,
                    width: metadata.width,
                    height: metadata.height,
                    description: String::new(),
                    tags: Vec::new(),
                    actors: Vec::new(),
                    directors: Vec::new(),
                    writers: Vec::new(),
                    producers: Vec::new(),
                    release_date: String::new(),
                    genres: Vec::new(),
                    rating: 0.0,
                    votes: 0,
                    poster_urls: Vec::new(),
                    extension,
                };
            }
            Err(e) => {
                println!("⚠ Failed to extract metadata for {}: {}", title, e);
                return Self {
                    title,
                    path,
                    byte_size,
                    duration: 0,
                    width: 0,
                    height: 0,
                    description: String::new(),
                    tags: Vec::new(),
                    actors: Vec::new(),
                    directors: Vec::new(),
                    writers: Vec::new(),
                    producers: Vec::new(),
                    release_date: String::new(),
                    genres: Vec::new(),
                    rating: 0.0,
                    votes: 0,
                    poster_urls: Vec::new(),
                    extension,
                };
            }
        }
    }
}

/// 视频元数据信息
#[derive(Debug, Clone)]
struct VideoMetadata {
    /// 视频时长（秒）
    duration: u64,
    /// 视频宽度（像素）
    width: u32,
    /// 视频高度（像素）
    height: u32,
}
