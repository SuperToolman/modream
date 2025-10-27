use async_trait::async_trait;
use domain::entity::media_library::{ActiveModel, Entity as MediaLibrary, Model as MediaLibraryModel};
use domain::repository::MediaLibraryRepository;
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, EntityTrait, Set,
};

/// 媒体库仓储实现
pub struct MediaLibraryRepositoryImpl {
    db: DatabaseConnection,
}

impl MediaLibraryRepositoryImpl {
    /// 创建新的媒体库仓储实例
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl MediaLibraryRepository for MediaLibraryRepositoryImpl {
    /// 根据 ID 查询媒体库
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MediaLibraryModel>> {
        let media_library = MediaLibrary::find_by_id(id).one(&self.db).await?;
        Ok(media_library)
    }

    /// 查询所有媒体库
    async fn find_all(&self) -> anyhow::Result<Vec<MediaLibraryModel>> {
        let media_libraries = MediaLibrary::find().all(&self.db).await?;
        Ok(media_libraries)
    }

    /// 创建新媒体库
    async fn create(&self, media_library: MediaLibraryModel) -> anyhow::Result<MediaLibraryModel> {
        use sea_orm::NotSet;

        let active_model = ActiveModel {
            id: NotSet,
            create_time: Set(media_library.create_time),
            update_time: Set(media_library.update_time),
            title: Set(media_library.title),
            paths_json: Set(media_library.paths_json),
            source: Set(media_library.source),
            media_type: Set(media_library.media_type),
            last_scanned: Set(media_library.last_scanned),
            item_count: Set(media_library.item_count),
            cover: Set(media_library.cover),
        };

        let created_media_library = active_model.insert(&self.db).await?;
        Ok(created_media_library)
    }

    /// 更新媒体库
    async fn update(&self, media_library: MediaLibraryModel) -> anyhow::Result<MediaLibraryModel> {
        let active_model = ActiveModel {
            id: Set(media_library.id),
            create_time: Set(media_library.create_time),
            update_time: Set(media_library.update_time),
            title: Set(media_library.title),
            paths_json: Set(media_library.paths_json),
            source: Set(media_library.source),
            media_type: Set(media_library.media_type),
            last_scanned: Set(media_library.last_scanned),
            item_count: Set(media_library.item_count),
            cover: Set(media_library.cover),
        };

        let updated_media_library = active_model.update(&self.db).await?;
        Ok(updated_media_library)
    }

    /// 删除媒体库
    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        MediaLibrary::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }
}

