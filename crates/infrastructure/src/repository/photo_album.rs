use async_trait::async_trait;
use domain::entity::photo::{Entity as Photo, Model as PhotoModel};
use domain::entity::photo_album::{ActiveModel as PhotoAlbumActiveModel, Column as PhotoAlbumColumn, Entity as PhotoAlbum, Model as PhotoAlbumModel};
use domain::entity::photo_album_item::{ActiveModel as PhotoAlbumItemActiveModel, Column as PhotoAlbumItemColumn, Entity as PhotoAlbumItem, Model as PhotoAlbumItemModel};
use domain::repository::{PhotoAlbumRepository, PhotoAlbumItemRepository};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    QuerySelect, Set, TransactionTrait,
};

// ==================== PhotoAlbumRepositoryImpl ====================

pub struct PhotoAlbumRepositoryImpl {
    db: DatabaseConnection,
}

impl PhotoAlbumRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl PhotoAlbumRepository for PhotoAlbumRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<PhotoAlbumModel>> {
        let album = PhotoAlbum::find_by_id(id).one(&self.db).await?;
        Ok(album)
    }

    async fn find_all(&self) -> anyhow::Result<Vec<PhotoAlbumModel>> {
        let albums = PhotoAlbum::find().all(&self.db).await?;
        Ok(albums)
    }

    async fn find_system_albums(&self) -> anyhow::Result<Vec<PhotoAlbumModel>> {
        let albums = PhotoAlbum::find()
            .filter(PhotoAlbumColumn::IsSystemAlbum.eq(true))
            .all(&self.db)
            .await?;
        Ok(albums)
    }

    async fn find_user_albums(&self) -> anyhow::Result<Vec<PhotoAlbumModel>> {
        let albums = PhotoAlbum::find()
            .filter(PhotoAlbumColumn::IsSystemAlbum.eq(false))
            .all(&self.db)
            .await?;
        Ok(albums)
    }

    async fn create(&self, album: PhotoAlbumModel) -> anyhow::Result<PhotoAlbumModel> {
        let active_model = PhotoAlbumActiveModel {
            id: sea_orm::NotSet,
            name: Set(album.name),
            description: Set(album.description),
            cover_photo_id: Set(album.cover_photo_id),
            sort_order: Set(album.sort_order),
            is_system_album: Set(album.is_system_album),
            is_private: Set(album.is_private),
            created_time: Set(album.created_time),
            updated_time: Set(album.updated_time),
        };

        let result = active_model.insert(&self.db).await?;
        Ok(result)
    }

    async fn update(&self, album: PhotoAlbumModel) -> anyhow::Result<PhotoAlbumModel> {
        let active_model = PhotoAlbumActiveModel {
            id: Set(album.id),
            name: Set(album.name),
            description: Set(album.description),
            cover_photo_id: Set(album.cover_photo_id),
            sort_order: Set(album.sort_order),
            is_system_album: Set(album.is_system_album),
            is_private: Set(album.is_private),
            created_time: Set(album.created_time),
            updated_time: Set(album.updated_time),
        };

        let result = active_model.update(&self.db).await?;
        Ok(result)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        PhotoAlbum::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_photos(&self, album_id: i32) -> anyhow::Result<i32> {
        let count = PhotoAlbumItem::find()
            .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }
}

// ==================== PhotoAlbumItemRepositoryImpl ====================

pub struct PhotoAlbumItemRepositoryImpl {
    db: DatabaseConnection,
}

impl PhotoAlbumItemRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl PhotoAlbumItemRepository for PhotoAlbumItemRepositoryImpl {
    async fn add_photo_to_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<PhotoAlbumItemModel> {
        // 检查是否已存在
        let existing = PhotoAlbumItem::find()
            .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
            .filter(PhotoAlbumItemColumn::PhotoId.eq(photo_id))
            .one(&self.db)
            .await?;

        if let Some(item) = existing {
            return Ok(item);
        }

        // 创建新的关联
        let active_model = PhotoAlbumItemActiveModel {
            id: sea_orm::NotSet,
            photo_album_id: Set(album_id),
            photo_id: Set(photo_id),
            added_time: Set(chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()),
            sort_order: Set(0),
        };

        let result = active_model.insert(&self.db).await?;
        Ok(result)
    }

    async fn remove_photo_from_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<()> {
        PhotoAlbumItem::delete_many()
            .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
            .filter(PhotoAlbumItemColumn::PhotoId.eq(photo_id))
            .exec(&self.db)
            .await?;
        Ok(())
    }

    async fn add_photos_to_album(&self, album_id: i32, photo_ids: Vec<i32>) -> anyhow::Result<Vec<PhotoAlbumItemModel>> {
        let txn = self.db.begin().await?;
        let mut results = Vec::new();

        for photo_id in photo_ids {
            // 检查是否已存在
            let existing = PhotoAlbumItem::find()
                .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
                .filter(PhotoAlbumItemColumn::PhotoId.eq(photo_id))
                .one(&txn)
                .await?;

            if existing.is_some() {
                continue;
            }

            let active_model = PhotoAlbumItemActiveModel {
                id: sea_orm::NotSet,
                photo_album_id: Set(album_id),
                photo_id: Set(photo_id),
                added_time: Set(chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()),
                sort_order: Set(0),
            };

            let result = active_model.insert(&txn).await?;
            results.push(result);
        }

        txn.commit().await?;
        Ok(results)
    }

    async fn find_photos_by_album_id(
        &self,
        album_id: i32,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        // 通过 PhotoAlbumItem 关联查询 Photo
        let photo_ids: Vec<i32> = PhotoAlbumItem::find()
            .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?
            .into_iter()
            .map(|item| item.photo_id)
            .collect();

        if photo_ids.is_empty() {
            return Ok(None);
        }

        let photos = Photo::find()
            .filter(domain::entity::photo::Column::Id.is_in(photo_ids))
            .all(&self.db)
            .await?;

        if photos.is_empty() {
            Ok(None)
        } else {
            Ok(Some(photos))
        }
    }

    async fn find_albums_by_photo_id(&self, photo_id: i32) -> anyhow::Result<Vec<PhotoAlbumModel>> {
        let album_ids: Vec<i32> = PhotoAlbumItem::find()
            .filter(PhotoAlbumItemColumn::PhotoId.eq(photo_id))
            .all(&self.db)
            .await?
            .into_iter()
            .map(|item| item.photo_album_id)
            .collect();

        if album_ids.is_empty() {
            return Ok(Vec::new());
        }

        let albums = PhotoAlbum::find()
            .filter(PhotoAlbumColumn::Id.is_in(album_ids))
            .all(&self.db)
            .await?;

        Ok(albums)
    }

    async fn update_sort_order(&self, album_id: i32, photo_id: i32, sort_order: i32) -> anyhow::Result<()> {
        let item = PhotoAlbumItem::find()
            .filter(PhotoAlbumItemColumn::PhotoAlbumId.eq(album_id))
            .filter(PhotoAlbumItemColumn::PhotoId.eq(photo_id))
            .one(&self.db)
            .await?;

        if let Some(item) = item {
            let mut active_model: PhotoAlbumItemActiveModel = item.into();
            active_model.sort_order = Set(sort_order);
            active_model.update(&self.db).await?;
        }

        Ok(())
    }
}

