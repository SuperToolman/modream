use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 创建媒体库请求 DTO
/// 用户只需提供基本信息，其他字段由系统自动生成
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateMediaLibraryRequest {
    /// 媒体库标题
    #[schema(example = "我的漫画库")]
    pub title: String,

    /// 媒体路径（支持 JSON 数组或单个路径）
    #[schema(example = "[\"D:/manga/path1\", \"D:/manga/path2\"]")]
    pub paths_json: String,

    /// 媒体来源
    #[schema(example = "本地")]
    pub source: String,

    /// 媒体类型
    #[schema(example = "漫画")]
    #[serde(rename = "type")]
    pub media_type: String,
}

/// 媒体库信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MediaLibraryInfo {
    pub id: i32,
    pub title: String,
    pub paths_json: String,
    pub source: String,
    #[serde(rename = "type")]
    pub media_type: String,
    pub create_time: String,
    pub update_time: String,
    pub last_scanned: String,
    pub item_count: i32,
    pub cover: Option<String>,
}

/// 从 Domain 层的 MediaLibrary Model 转换为 MediaLibraryInfo DTO
impl From<domain::entity::media_library::Model> for MediaLibraryInfo {
    fn from(media_library: domain::entity::media_library::Model) -> Self {
        MediaLibraryInfo {
            id: media_library.id,
            title: media_library.title,
            paths_json: media_library.paths_json,
            source: media_library.source,
            media_type: media_library.media_type,
            create_time: media_library.create_time,
            update_time: media_library.update_time,
            last_scanned: media_library.last_scanned,
            item_count: media_library.item_count,
            cover: media_library.cover,
        }
    }
}

