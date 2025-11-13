//! PhotoAlbumItem Entity - 照片与相册关联实体

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "PhotoAlbumItem")]
pub struct Model {
    /// 主键 ID
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    
    /// 相册 ID
    #[sea_orm(column_name = "PhotoAlbumId")]
    pub photo_album_id: i32,
    
    /// 照片 ID
    #[sea_orm(column_name = "PhotoId")]
    pub photo_id: i32,
    
    /// 添加到相册的时间
    #[sea_orm(column_name = "AddedTime", column_type = "custom(\"DATETIME\")")]
    pub added_time: String,
    
    /// 在相册中的排序顺序
    #[sea_orm(column_name = "SortOrder")]
    pub sort_order: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// 关联到 PhotoAlbum（多对一）
    #[sea_orm(
        belongs_to = "super::photo_album::Entity",
        from = "Column::PhotoAlbumId",
        to = "super::photo_album::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    PhotoAlbum,
    
    /// 关联到 Photo（多对一）
    #[sea_orm(
        belongs_to = "super::photo::Entity",
        from = "Column::PhotoId",
        to = "super::photo::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Photo,
}

impl Related<super::photo_album::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PhotoAlbum.def()
    }
}

impl Related<super::photo::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Photo.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

