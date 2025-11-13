//! PhotoAlbum Entity - 相册实体

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "PhotoAlbum")]
pub struct Model {
    /// 主键 ID
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    
    /// 相册名称
    #[sea_orm(column_name = "Name", column_type = "Text")]
    pub name: String,
    
    /// 相册描述
    #[sea_orm(column_name = "Description", column_type = "Text", nullable)]
    pub description: Option<String>,
    
    /// 封面照片 ID
    #[sea_orm(column_name = "CoverPhotoId", nullable)]
    pub cover_photo_id: Option<i32>,
    
    /// 排序顺序（数字越小越靠前）
    #[sea_orm(column_name = "SortOrder")]
    pub sort_order: i32,
    
    /// 是否为系统相册（如：最近添加、收藏夹等）
    #[sea_orm(column_name = "IsSystemAlbum")]
    pub is_system_album: bool,
    
    /// 是否为私密相册
    #[sea_orm(column_name = "IsPrivate")]
    pub is_private: bool,
    
    /// 创建时间
    #[sea_orm(column_name = "CreatedTime", column_type = "custom(\"DATETIME\")")]
    pub created_time: String,
    
    /// 更新时间
    #[sea_orm(column_name = "UpdatedTime", column_type = "custom(\"DATETIME\")")]
    pub updated_time: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// 关联到 Photo（封面照片，多对一）
    #[sea_orm(
        belongs_to = "super::photo::Entity",
        from = "Column::CoverPhotoId",
        to = "super::photo::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    CoverPhoto,
    
    /// 关联到 PhotoAlbumItem（一对多）
    #[sea_orm(has_many = "super::photo_album_item::Entity")]
    PhotoAlbumItem,
}

impl Related<super::photo::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CoverPhoto.def()
    }
}

impl Related<super::photo_album_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PhotoAlbumItem.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

