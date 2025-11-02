use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 创建游戏请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateGameRequest {
    /// 游戏标题
    pub title: String,
    /// 游戏子标题
    pub sub_title: Option<String>,
    /// 游戏封面列表（JSON 数组）
    pub covers: Option<String>,
    /// 游戏版本
    pub version: Option<String>,
    /// 游戏根目录
    pub root_path: String,
    /// 启动路径列表（JSON 数组）
    pub start_paths: String,
    /// 默认启动路径
    pub start_path_default: Option<String>,
    /// 启动项数量
    pub start_item_count: i32,
    /// 游戏描述
    pub description: String,
    /// 游戏发行时间
    pub release_date: String,
    /// 开发商
    pub developer: Option<String>,
    /// 发行商
    pub publisher: Option<String>,
    /// 游戏标签（JSON 数组）
    pub tabs: Option<String>,
    /// 游戏平台
    pub platform: Option<String>,
    /// 游戏字节大小
    pub byte_size: i32,
    /// 所属媒体库 ID
    pub media_library_id: i32,
}

/// 游戏信息响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GameInfo {
    /// 游戏 ID
    pub id: i32,
    /// 创建时间
    pub create_time: String,
    /// 更新时间
    pub update_time: String,
    /// 游戏标题
    pub title: String,
    /// 游戏子标题
    pub sub_title: Option<String>,
    /// 游戏封面列表
    #[serde(skip_serializing_if = "Option::is_none")]
    pub covers: Option<Vec<String>>,
    /// 游戏版本
    pub version: Option<String>,
    /// 游戏根目录
    pub root_path: String,
    /// 启动路径列表
    pub start_paths: Vec<String>,
    /// 默认启动路径
    pub start_path_default: Option<String>,
    /// 启动项数量
    pub start_item_count: i32,
    /// 游戏描述
    pub description: String,
    /// 游戏发行时间
    pub release_date: String,
    /// 开发商
    pub developer: Option<String>,
    /// 发行商
    pub publisher: Option<String>,
    /// 游戏标签
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tabs: Option<Vec<String>>,
    /// 游戏平台
    pub platform: Option<String>,
    /// 游戏字节大小
    pub byte_size: i32,
    /// 格式化后的文件大小（如 "1.5 GB"）
    pub formatted_size: String,
    /// 所属媒体库 ID
    pub media_library_id: i32,
}

impl From<domain::entity::game::Model> for GameInfo {
    fn from(model: domain::entity::game::Model) -> Self {
        // 解析 covers JSON 字符串为 Vec<String>
        let covers = model.covers.and_then(|c| serde_json::from_str(&c).ok());
        
        // 解析 start_paths JSON 字符串为 Vec<String>
        let start_paths = serde_json::from_str(&model.start_paths).unwrap_or_default();
        
        // 解析 tabs JSON 字符串为 Vec<String>
        let tabs = model.tabs.and_then(|t| {
            // 如果是逗号分隔的字符串，先转换为数组
            if t.starts_with('[') {
                serde_json::from_str(&t).ok()
            } else {
                Some(t.split(',').map(|s| s.trim().to_string()).collect())
            }
        });
        
        // 格式化文件大小
        let formatted_size = format_byte_size(model.byte_size as u64);
        
        Self {
            id: model.id,
            create_time: model.create_time,
            update_time: model.update_time,
            title: model.title,
            sub_title: model.sub_title,
            covers,
            version: model.version,
            root_path: model.root_path,
            start_paths,
            start_path_default: model.start_path_default,
            start_item_count: model.start_item_count,
            description: model.description,
            release_date: model.release_date,
            developer: model.developer,
            publisher: model.publisher,
            tabs,
            platform: model.platform,
            byte_size: model.byte_size,
            formatted_size,
            media_library_id: model.media_library_id,
        }
    }
}

/// 格式化字节大小为人类可读格式
fn format_byte_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;
    const TB: u64 = GB * 1024;

    if bytes >= TB {
        format!("{:.2} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

/// 扫描游戏请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct ScanGamesRequest {
    /// 要扫描的路径
    #[schema(example = "D:/Games")]
    pub path: String,
    /// 游戏数据库提供者列表（如 "IGDB,DLSITE,STEAMDB"）
    #[schema(example = "IGDB")]
    pub providers: String,
    /// 所属媒体库 ID
    #[schema(example = 1)]
    pub media_library_id: i32,
}

/// 启动游戏请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct LaunchGameRequest {
    /// 启动路径（可选，如果不提供则使用默认启动路径）
    #[schema(example = "game.exe")]
    pub start_path: Option<String>,
}

/// 更新默认启动路径请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateDefaultStartPathRequest {
    /// 默认启动路径
    #[schema(example = "game.exe")]
    pub start_path_default: String,
}

