use domain::repository::{PhotoRepository, PhotoExifRepository, PhotoAlbumRepository, PhotoAlbumItemRepository};
use std::sync::Arc;
use crate::dto::{PhotoInfo, PhotoDetailInfo, PhotoAlbumInfo};

/// 照片服务 - 处理照片相关的业务逻辑
pub struct PhotoService {
    photo_repo: Arc<dyn PhotoRepository>,
    exif_repo: Arc<dyn PhotoExifRepository>,
    album_repo: Arc<dyn PhotoAlbumRepository>,
    album_item_repo: Arc<dyn PhotoAlbumItemRepository>,
}

impl PhotoService {
    /// 创建新的照片服务实例
    pub fn new(
        photo_repo: Arc<dyn PhotoRepository>,
        exif_repo: Arc<dyn PhotoExifRepository>,
        album_repo: Arc<dyn PhotoAlbumRepository>,
        album_item_repo: Arc<dyn PhotoAlbumItemRepository>,
    ) -> Self {
        Self {
            photo_repo,
            exif_repo,
            album_repo,
            album_item_repo,
        }
    }

    // ==================== 照片管理 ====================

    /// 根据 ID 查询照片
    pub async fn get_by_id(&self, id: i32) -> anyhow::Result<PhotoInfo> {
        let photo = self
            .photo_repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Photo not found with id: {}", id))?;
        Ok(photo.into())
    }

    /// 根据 ID 查询照片详细信息（包含 EXIF）
    pub async fn get_detail_by_id(&self, id: i32) -> anyhow::Result<PhotoDetailInfo> {
        let (photo, exif) = self
            .photo_repo
            .find_by_id_with_exif(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Photo not found with id: {}", id))?;

        Ok(PhotoDetailInfo {
            photo: photo.into(),
            exif: exif.map(|e| e.into()),
        })
    }

    /// 分页查询所有照片
    pub async fn get_paged(
        &self,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<PhotoInfo>, i32)> {
        let photos = self
            .photo_repo
            .find_by_paged(page_size, page_index)
            .await?
            .unwrap_or_default();

        let total = self.photo_repo.count_all().await?;

        let photo_infos = photos.into_iter().map(|p| p.into()).collect();

        Ok((photo_infos, total))
    }

    /// 根据媒体库 ID 分页查询照片
    pub async fn get_by_media_library_id_paged(
        &self,
        media_library_id: i32,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<PhotoInfo>, i32)> {
        let photos = self
            .photo_repo
            .find_by_media_library_id_paged(media_library_id, page_size, page_index)
            .await?
            .unwrap_or_default();

        let total = self
            .photo_repo
            .count_by_media_library_id(media_library_id)
            .await?;

        let photo_infos = photos.into_iter().map(|p| p.into()).collect();

        Ok((photo_infos, total))
    }

    /// 查询收藏的照片
    pub async fn get_favorites_paged(
        &self,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<PhotoInfo>, i32)> {
        let photos = self
            .photo_repo
            .find_favorites_paged(page_size, page_index)
            .await?
            .unwrap_or_default();

        // 注意：这里没有直接的收藏总数统计方法，需要遍历或添加新的 repository 方法
        let total = photos.len() as i32;

        let photo_infos = photos.into_iter().map(|p| p.into()).collect();

        Ok((photo_infos, total))
    }

    /// 根据标签查询照片
    pub async fn get_by_tag(
        &self,
        tag: &str,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<Vec<PhotoInfo>> {
        let photos = self
            .photo_repo
            .find_by_tag(tag, page_size, page_index)
            .await?
            .unwrap_or_default();

        let photo_infos = photos.into_iter().map(|p| p.into()).collect();

        Ok(photo_infos)
    }

    /// 切换照片收藏状态
    pub async fn toggle_favorite(&self, id: i32) -> anyhow::Result<PhotoInfo> {
        let photo = self.photo_repo.toggle_favorite(id).await?;
        Ok(photo.into())
    }

    /// 删除照片（软删除）
    pub async fn delete(&self, id: i32) -> anyhow::Result<()> {
        // 先检查照片是否存在
        let _photo = self.get_by_id(id).await?;

        // 软删除照片
        self.photo_repo.delete(id).await?;

        tracing::info!("Soft deleted photo with id: {}", id);

        Ok(())
    }

    /// 永久删除照片
    pub async fn delete_permanently(&self, id: i32) -> anyhow::Result<()> {
        // 先检查照片是否存在
        let _photo = self.get_by_id(id).await?;

        // 永久删除照片
        self.photo_repo.delete_permanently(id).await?;

        tracing::info!("Permanently deleted photo with id: {}", id);

        Ok(())
    }

    /// 获取照片文件路径（用于流式传输）
    pub async fn get_photo_path(&self, id: i32) -> anyhow::Result<String> {
        let photo = self
            .photo_repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Photo not found with id: {}", id))?;
        Ok(photo.path)
    }

    /// 获取缩略图路径
    pub async fn get_thumbnail_path(&self, id: i32) -> anyhow::Result<Option<String>> {
        let photo = self
            .photo_repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Photo not found with id: {}", id))?;
        Ok(photo.thumbnail_path)
    }

    /// 根据哈希查找照片（用于去重）
    pub async fn find_by_hash(&self, hash: &str) -> anyhow::Result<Option<PhotoInfo>> {
        let photo = self.photo_repo.find_by_hash(hash).await?;
        Ok(photo.map(|p| p.into()))
    }

    // ==================== 相册管理 ====================

    /// 根据 ID 查询相册
    pub async fn get_album_by_id(&self, id: i32) -> anyhow::Result<PhotoAlbumInfo> {
        let album = self
            .album_repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Album not found with id: {}", id))?;

        let photo_count = self.album_repo.count_photos(id).await?;

        let mut album_info: PhotoAlbumInfo = album.into();
        album_info.photo_count = Some(photo_count);

        Ok(album_info)
    }

    /// 查询所有相册
    pub async fn get_all_albums(&self) -> anyhow::Result<Vec<PhotoAlbumInfo>> {
        let albums = self.album_repo.find_all().await?;

        let mut album_infos = Vec::new();
        for album in albums {
            let photo_count = self.album_repo.count_photos(album.id).await?;
            let mut album_info: PhotoAlbumInfo = album.into();
            album_info.photo_count = Some(photo_count);
            album_infos.push(album_info);
        }

        Ok(album_infos)
    }

    /// 查询系统相册
    pub async fn get_system_albums(&self) -> anyhow::Result<Vec<PhotoAlbumInfo>> {
        let albums = self.album_repo.find_system_albums().await?;

        let mut album_infos = Vec::new();
        for album in albums {
            let photo_count = self.album_repo.count_photos(album.id).await?;
            let mut album_info: PhotoAlbumInfo = album.into();
            album_info.photo_count = Some(photo_count);
            album_infos.push(album_info);
        }

        Ok(album_infos)
    }

    /// 查询用户相册
    pub async fn get_user_albums(&self) -> anyhow::Result<Vec<PhotoAlbumInfo>> {
        let albums = self.album_repo.find_user_albums().await?;

        let mut album_infos = Vec::new();
        for album in albums {
            let photo_count = self.album_repo.count_photos(album.id).await?;
            let mut album_info: PhotoAlbumInfo = album.into();
            album_info.photo_count = Some(photo_count);
            album_infos.push(album_info);
        }

        Ok(album_infos)
    }

    /// 创建相册
    pub async fn create_album(&self, album: domain::entity::photo_album::Model) -> anyhow::Result<PhotoAlbumInfo> {
        let created_album = self.album_repo.create(album).await?;
        Ok(created_album.into())
    }

    /// 更新相册
    pub async fn update_album(&self, album: domain::entity::photo_album::Model) -> anyhow::Result<PhotoAlbumInfo> {
        let updated_album = self.album_repo.update(album).await?;
        Ok(updated_album.into())
    }

    /// 删除相册
    pub async fn delete_album(&self, id: i32) -> anyhow::Result<()> {
        // 先检查相册是否存在
        let _album = self.get_album_by_id(id).await?;

        // 删除相册（级联删除相册项）
        self.album_repo.delete(id).await?;

        tracing::info!("Deleted album with id: {}", id);

        Ok(())
    }

    // ==================== 相册照片管理 ====================

    /// 添加照片到相册
    pub async fn add_photo_to_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<()> {
        self.album_item_repo.add_photo_to_album(album_id, photo_id).await?;
        Ok(())
    }

    /// 从相册移除照片
    pub async fn remove_photo_from_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<()> {
        self.album_item_repo.remove_photo_from_album(album_id, photo_id).await?;
        Ok(())
    }

    /// 批量添加照片到相册
    pub async fn add_photos_to_album(&self, album_id: i32, photo_ids: Vec<i32>) -> anyhow::Result<()> {
        self.album_item_repo.add_photos_to_album(album_id, photo_ids).await?;
        Ok(())
    }

    /// 查询相册中的照片
    pub async fn get_photos_by_album_id(
        &self,
        album_id: i32,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<PhotoInfo>, i32)> {
        let photos = self
            .album_item_repo
            .find_photos_by_album_id(album_id, page_size, page_index)
            .await?
            .unwrap_or_default();

        let total = self.album_repo.count_photos(album_id).await?;

        let photo_infos = photos.into_iter().map(|p| p.into()).collect();

        Ok((photo_infos, total))
    }

    /// 查询照片所在的所有相册
    pub async fn get_albums_by_photo_id(&self, photo_id: i32) -> anyhow::Result<Vec<PhotoAlbumInfo>> {
        let albums = self.album_item_repo.find_albums_by_photo_id(photo_id).await?;
        let album_infos = albums.into_iter().map(|a| a.into()).collect();
        Ok(album_infos)
    }
}

