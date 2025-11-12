use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 电影信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MovieInfo {
    /// 电影 ID
    #[schema(example = 1)]
    pub id: i32,
    
    /// 创建时间
    #[schema(example = "2025-11-11 17:50:54")]
    pub create_time: String,
    
    /// 更新时间
    #[schema(example = "2025-11-11 17:50:54")]
    pub update_time: String,
    
    /// 电影标题
    #[schema(example = "阿凡达")]
    pub title: String,
    
    /// 原始标题
    #[schema(example = "Avatar")]
    pub original_title: Option<String>,
    
    /// 电影描述/简介
    #[schema(example = "一部关于潘多拉星球的科幻电影")]
    pub description: Option<String>,
    
    /// 视频文件路径
    #[schema(example = "G:\\Movies\\Avatar.mkv")]
    pub path: String,
    
    /// 文件大小（字节）
    #[schema(example = 15000000000i64)]
    pub byte_size: i64,
    
    /// 格式化后的文件大小（如 "14.0 GB"）
    #[schema(example = "14.0 GB")]
    pub formatted_size: String,
    
    /// 文件扩展名
    #[schema(example = "mkv")]
    pub extension: Option<String>,
    
    /// 时长（秒）
    #[schema(example = 9720)]
    pub duration: i32,
    
    /// 格式化后的时长（如 "2h 42m"）
    #[schema(example = "2h 42m")]
    pub formatted_duration: String,
    
    /// 视频宽度（像素）
    #[schema(example = 1920)]
    pub width: i32,
    
    /// 视频高度（像素）
    #[schema(example = 1080)]
    pub height: i32,
    
    /// 分辨率字符串（如 "1920x1080"）
    #[schema(example = "1920x1080")]
    pub resolution: Option<String>,
    
    /// 上映日期（YYYY-MM-DD）
    #[schema(example = "2009-12-18")]
    pub release_date: Option<String>,
    
    /// 评分（0-10）
    #[schema(example = 7.8)]
    pub rating: f32,
    
    /// 评价人数
    #[schema(example = 1234567)]
    pub votes: i32,
    
    /// 类型/流派列表
    #[schema(example = json!(["科幻", "动作", "冒险"]))]
    pub genres: Option<Vec<String>>,
    
    /// 主演列表
    #[schema(example = json!(["萨姆·沃辛顿", "佐伊·索尔达娜"]))]
    pub actors: Option<Vec<String>>,
    
    /// 导演列表
    #[schema(example = json!(["詹姆斯·卡梅隆"]))]
    pub directors: Option<Vec<String>>,
    
    /// 编剧列表
    #[schema(example = json!(["詹姆斯·卡梅隆"]))]
    pub writers: Option<Vec<String>>,
    
    /// 制片人列表
    #[schema(example = json!(["乔恩·兰道"]))]
    pub producers: Option<Vec<String>>,
    
    /// 标签列表
    #[schema(example = json!(["IMAX", "3D"]))]
    pub tags: Option<Vec<String>>,
    
    /// 海报 URL 列表
    #[schema(example = json!(["https://image.tmdb.org/t/p/w500/poster.jpg"]))]
    pub poster_urls: Option<Vec<String>>,
    
    /// 封面图片路径
    #[schema(example = "/api/movies/1/cover")]
    pub cover: Option<String>,
    
    /// 所属媒体库 ID
    #[schema(example = 1)]
    pub media_library_id: i32,
}

/// 从 Domain 层的 Movie Model 转换为 MovieInfo DTO
impl From<domain::entity::movie::Model> for MovieInfo {
    fn from(model: domain::entity::movie::Model) -> Self {
        // 解析 JSON 数组字段
        let genres = model.genres.and_then(|g| serde_json::from_str(&g).ok());
        let actors = model.actors.and_then(|a| serde_json::from_str(&a).ok());
        let directors = model.directors.and_then(|d| serde_json::from_str(&d).ok());
        let writers = model.writers.and_then(|w| serde_json::from_str(&w).ok());
        let producers = model.producers.and_then(|p| serde_json::from_str(&p).ok());
        let tags = model.tags.and_then(|t| serde_json::from_str(&t).ok());
        let poster_urls = model.poster_urls.and_then(|p| serde_json::from_str(&p).ok());
        
        // 格式化文件大小
        let formatted_size = format_byte_size(model.byte_size);
        
        // 格式化时长
        let formatted_duration = format_duration(model.duration);
        
        MovieInfo {
            id: model.id,
            create_time: model.create_time,
            update_time: model.update_time,
            title: model.title,
            original_title: model.original_title,
            description: model.description,
            path: model.path,
            byte_size: model.byte_size,
            formatted_size,
            extension: model.extension,
            duration: model.duration,
            formatted_duration,
            width: model.width,
            height: model.height,
            resolution: model.resolution,
            release_date: model.release_date,
            rating: model.rating,
            votes: model.votes,
            genres,
            actors,
            directors,
            writers,
            producers,
            tags,
            poster_urls,
            cover: model.cover,
            media_library_id: model.media_library_id,
        }
    }
}

/// 格式化字节大小为人类可读格式
fn format_byte_size(bytes: i64) -> String {
    const KB: i64 = 1024;
    const MB: i64 = KB * 1024;
    const GB: i64 = MB * 1024;
    const TB: i64 = GB * 1024;

    if bytes >= TB {
        format!("{:.1} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.1} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

/// 格式化时长为人类可读格式
fn format_duration(seconds: i32) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    
    if hours > 0 {
        format!("{}h {}m", hours, minutes)
    } else {
        format!("{}m", minutes)
    }
}

