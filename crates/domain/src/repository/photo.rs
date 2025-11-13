use crate::entity::photo::Model as PhotoModel;
use crate::entity::photo_exif::Model as PhotoExifModel;
use crate::entity::photo_album::Model as PhotoAlbumModel;
use crate::entity::photo_album_item::Model as PhotoAlbumItemModel;
use async_trait::async_trait;

/// 照片仓储接口
/// 定义所有照片数据访问操作的抽象接口
#[async_trait]
pub trait PhotoRepository: Send + Sync {
    /// 根据 ID 查询照片
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<PhotoModel>>;

    /// 根据 ID 查询照片及其 EXIF 信息
    async fn find_by_id_with_exif(&self, id: i32) -> anyhow::Result<Option<(PhotoModel, Option<PhotoExifModel>)>>;

    /// 分页查询照片
    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>>;

    /// 根据媒体库 ID 分页查询照片
    async fn find_by_media_library_id_paged(
        &self,
        media_library_id: i32,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>>;

    /// 根据收藏状态查询照片
    async fn find_favorites_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>>;

    /// 根据标签查询照片
    async fn find_by_tag(
        &self,
        tag: &str,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>>;

    /// 创建新照片
    async fn create(&self, photo: PhotoModel) -> anyhow::Result<PhotoModel>;

    /// 批量创建照片
    async fn create_batch(&self, photos: Vec<PhotoModel>) -> anyhow::Result<Vec<PhotoModel>>;

    /// 更新照片
    async fn update(&self, photo: PhotoModel) -> anyhow::Result<PhotoModel>;

    /// 批量更新照片（使用事务）
    async fn update_batch(&self, photos: Vec<PhotoModel>) -> anyhow::Result<Vec<PhotoModel>>;

    /// 删除照片（软删除）
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 永久删除照片
    async fn delete_permanently(&self, id: i32) -> anyhow::Result<()>;

    /// 获取所有照片的总数
    async fn count_all(&self) -> anyhow::Result<i32>;

    /// 根据媒体库 ID 获取照片数量
    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32>;

    /// 根据哈希值查找照片（用于去重）
    async fn find_by_hash(&self, hash: &str) -> anyhow::Result<Option<PhotoModel>>;

    /// 切换收藏状态
    async fn toggle_favorite(&self, id: i32) -> anyhow::Result<PhotoModel>;
}

/// 照片 EXIF 仓储接口
#[async_trait]
pub trait PhotoExifRepository: Send + Sync {
    /// 根据照片 ID 查询 EXIF 信息
    async fn find_by_photo_id(&self, photo_id: i32) -> anyhow::Result<Option<PhotoExifModel>>;

    /// 创建 EXIF 信息
    async fn create(&self, exif: PhotoExifModel) -> anyhow::Result<PhotoExifModel>;

    /// 批量创建 EXIF 信息
    async fn create_batch(&self, exifs: Vec<PhotoExifModel>) -> anyhow::Result<Vec<PhotoExifModel>>;

    /// 更新 EXIF 信息
    async fn update(&self, exif: PhotoExifModel) -> anyhow::Result<PhotoExifModel>;

    /// 删除 EXIF 信息
    async fn delete_by_photo_id(&self, photo_id: i32) -> anyhow::Result<()>;
}

/// 相册仓储接口
#[async_trait]
pub trait PhotoAlbumRepository: Send + Sync {
    /// 根据 ID 查询相册
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<PhotoAlbumModel>>;

    /// 查询所有相册
    async fn find_all(&self) -> anyhow::Result<Vec<PhotoAlbumModel>>;

    /// 查询系统相册
    async fn find_system_albums(&self) -> anyhow::Result<Vec<PhotoAlbumModel>>;

    /// 查询用户相册
    async fn find_user_albums(&self) -> anyhow::Result<Vec<PhotoAlbumModel>>;

    /// 创建相册
    async fn create(&self, album: PhotoAlbumModel) -> anyhow::Result<PhotoAlbumModel>;

    /// 更新相册
    async fn update(&self, album: PhotoAlbumModel) -> anyhow::Result<PhotoAlbumModel>;

    /// 删除相册
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 获取相册中的照片数量
    async fn count_photos(&self, album_id: i32) -> anyhow::Result<i32>;
}

/// 相册项仓储接口
#[async_trait]
pub trait PhotoAlbumItemRepository: Send + Sync {
    /// 添加照片到相册
    async fn add_photo_to_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<PhotoAlbumItemModel>;

    /// 从相册移除照片
    async fn remove_photo_from_album(&self, album_id: i32, photo_id: i32) -> anyhow::Result<()>;

    /// 批量添加照片到相册
    async fn add_photos_to_album(&self, album_id: i32, photo_ids: Vec<i32>) -> anyhow::Result<Vec<PhotoAlbumItemModel>>;

    /// 获取相册中的所有照片
    async fn find_photos_by_album_id(
        &self,
        album_id: i32,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>>;

    /// 获取照片所在的所有相册
    async fn find_albums_by_photo_id(&self, photo_id: i32) -> anyhow::Result<Vec<PhotoAlbumModel>>;

    /// 更新照片在相册中的排序
    async fn update_sort_order(&self, album_id: i32, photo_id: i32, sort_order: i32) -> anyhow::Result<()>;
}

