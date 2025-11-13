//! Photo Entity - 照片实体

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "Photo")]
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
    
    /// 照片文件路径
    #[sea_orm(column_name = "Path", column_type = "Text")]
    pub path: String,
    
    /// 文件大小（字节）
    #[sea_orm(column_name = "ByteSize")]
    pub byte_size: i64,
    
    /// 分辨率字符串（如 "1920x1080"）
    #[sea_orm(column_name = "Resolution", column_type = "Text", nullable)]
    pub resolution: Option<String>,
    
    /// 文件扩展名
    #[sea_orm(column_name = "Extension", column_type = "Text", nullable)]
    pub extension: Option<String>,
    
    /// 图片宽度（像素）
    #[sea_orm(column_name = "Width", nullable)]
    pub width: Option<i32>,
    
    /// 图片高度（像素）
    #[sea_orm(column_name = "Height", nullable)]
    pub height: Option<i32>,
    
    /// 缩略图路径
    #[sea_orm(column_name = "ThumbnailPath", column_type = "Text", nullable)]
    pub thumbnail_path: Option<String>,
    
    /// 文件哈希值（用于去重和完整性校验）
    #[sea_orm(column_name = "Hash", column_type = "Text", nullable)]
    pub hash: Option<String>,
    
    /// 软删除标记
    #[sea_orm(column_name = "IsDeleted")]
    pub is_deleted: bool,
    
    /// 是否收藏
    #[sea_orm(column_name = "IsFavorite")]
    pub is_favorite: bool,
    
    /// 标签列表（逗号分隔）
    #[sea_orm(column_name = "Tags", column_type = "Text", nullable)]
    pub tags: Option<String>,
    
    /// 所属媒体库 ID
    #[sea_orm(column_name = "MediaLibraryId")]
    pub media_library_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// 关联到 MediaLibrary（多对一）
    #[sea_orm(
        belongs_to = "super::media_library::Entity",
        from = "Column::MediaLibraryId",
        to = "super::media_library::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    MediaLibrary,
    
    /// 关联到 PhotoExif（一对一）
    #[sea_orm(has_one = "super::photo_exif::Entity")]
    PhotoExif,
    
    /// 关联到 PhotoAlbumItem（一对多）
    #[sea_orm(has_many = "super::photo_album_item::Entity")]
    PhotoAlbumItem,
}

impl Related<super::media_library::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MediaLibrary.def()
    }
}

impl Related<super::photo_exif::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PhotoExif.def()
    }
}

impl Related<super::photo_album_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PhotoAlbumItem.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

