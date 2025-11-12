//! Movie Entity - 电影实体

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "Movie")]
pub struct Model {
    /// 主键 ID
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    
    /// 创建时间
    #[sea_orm(column_name = "CreateTime", column_type = "custom(\"DATETIME\")")]
    pub create_time: String,
    
    /// 更新时间
    #[sea_orm(column_name = "UpdateTime", column_type = "custom(\"DATETIME\")")]
    pub update_time: String,
    
    /// 电影标题
    #[sea_orm(column_name = "Title", column_type = "Text")]
    pub title: String,
    
    /// 原始标题
    #[sea_orm(column_name = "OriginalTitle", column_type = "Text", nullable)]
    pub original_title: Option<String>,
    
    /// 电影描述/简介
    #[sea_orm(column_name = "Description", column_type = "Text", nullable)]
    pub description: Option<String>,
    
    /// 视频文件路径
    #[sea_orm(column_name = "Path", column_type = "Text")]
    pub path: String,
    
    /// 文件大小（字节）
    #[sea_orm(column_name = "ByteSize")]
    pub byte_size: i64,
    
    /// 文件扩展名
    #[sea_orm(column_name = "Extension", column_type = "Text", nullable)]
    pub extension: Option<String>,
    
    /// 时长（秒）
    #[sea_orm(column_name = "Duration")]
    pub duration: i32,
    
    /// 视频宽度（像素）
    #[sea_orm(column_name = "Width")]
    pub width: i32,
    
    /// 视频高度（像素）
    #[sea_orm(column_name = "Height")]
    pub height: i32,
    
    /// 分辨率字符串（如 "1920x1080"）
    #[sea_orm(column_name = "Resolution", column_type = "Text", nullable)]
    pub resolution: Option<String>,
    
    /// 上映日期（YYYY-MM-DD）
    #[sea_orm(column_name = "ReleaseDate", column_type = "Text", nullable)]
    pub release_date: Option<String>,
    
    /// 评分（0-10）
    #[sea_orm(column_name = "Rating")]
    pub rating: f32,
    
    /// 评价人数
    #[sea_orm(column_name = "Votes")]
    pub votes: i32,
    
    /// 类型/流派列表（JSON 数组）
    #[sea_orm(column_name = "Genres", column_type = "Text", nullable)]
    pub genres: Option<String>,
    
    /// 主演列表（JSON 数组）
    #[sea_orm(column_name = "Actors", column_type = "Text", nullable)]
    pub actors: Option<String>,
    
    /// 导演列表（JSON 数组）
    #[sea_orm(column_name = "Directors", column_type = "Text", nullable)]
    pub directors: Option<String>,
    
    /// 编剧列表（JSON 数组）
    #[sea_orm(column_name = "Writers", column_type = "Text", nullable)]
    pub writers: Option<String>,
    
    /// 制片人列表（JSON 数组）
    #[sea_orm(column_name = "Producers", column_type = "Text", nullable)]
    pub producers: Option<String>,
    
    /// 标签列表（JSON 数组）
    #[sea_orm(column_name = "Tags", column_type = "Text", nullable)]
    pub tags: Option<String>,
    
    /// 海报 URL 列表（JSON 数组）
    #[sea_orm(column_name = "PosterUrls", column_type = "Text", nullable)]
    pub poster_urls: Option<String>,
    
    /// 封面图片路径
    #[sea_orm(column_name = "Cover", column_type = "Text", nullable)]
    pub cover: Option<String>,
    
    /// 所属媒体库 ID
    #[sea_orm(column_name = "MediaLibraryId")]
    pub media_library_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::media_library::Entity",
        from = "Column::MediaLibraryId",
        to = "super::media_library::Column::Id"
    )]
    MediaLibrary,
}

impl Related<super::media_library::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MediaLibrary.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    /// 创建新电影实体
    ///
    /// # 参数
    /// - `title`: 电影标题
    /// - `path`: 视频文件路径
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `Self` - 创建的电影实体
    pub fn new(title: String, path: String, media_library_id: i32) -> Self {
        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        Self {
            id: 0, // 数据库会自动生成
            create_time: now.clone(),
            update_time: now,
            title,
            original_title: None,
            description: None,
            path,
            byte_size: 0,
            extension: None,
            duration: 0,
            width: 0,
            height: 0,
            resolution: None,
            release_date: None,
            rating: 0.0,
            votes: 0,
            genres: None,
            actors: None,
            directors: None,
            writers: None,
            producers: None,
            tags: None,
            poster_urls: None,
            cover: None,
            media_library_id,
        }
    }

    /// 获取分辨率字符串
    pub fn get_resolution(&self) -> String {
        self.resolution.clone().unwrap_or_else(|| {
            if self.width > 0 && self.height > 0 {
                format!("{}x{}", self.width, self.height)
            } else {
                "未知".to_string()
            }
        })
    }
    
    /// 获取类型列表
    pub fn get_genres(&self) -> Vec<String> {
        self.genres
            .as_ref()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default()
    }
    
    /// 获取主演列表
    pub fn get_actors(&self) -> Vec<String> {
        self.actors
            .as_ref()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default()
    }
    
    /// 获取导演列表
    pub fn get_directors(&self) -> Vec<String> {
        self.directors
            .as_ref()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default()
    }
    
    /// 获取海报 URL 列表
    pub fn get_poster_urls(&self) -> Vec<String> {
        self.poster_urls
            .as_ref()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default()
    }
}

