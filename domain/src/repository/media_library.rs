use crate::entity::media_library::Model as MediaLibraryModel;
use async_trait::async_trait;

/// 媒体库仓储接口
/// 定义所有媒体库数据访问操作的抽象接口
#[async_trait]
pub trait MediaLibraryRepository: Send + Sync {
    /// 根据 ID 查询媒体库
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MediaLibraryModel>>;

    /// 查询所有媒体库
    async fn find_all(&self) -> anyhow::Result<Vec<MediaLibraryModel>>;

    /// 创建新媒体库
    async fn create(&self, media_library: MediaLibraryModel) -> anyhow::Result<MediaLibraryModel>;

    /// 更新媒体库
    async fn update(&self, media_library: MediaLibraryModel) -> anyhow::Result<MediaLibraryModel>;

    /// 删除媒体库
    async fn delete(&self, id: i32) -> anyhow::Result<()>;
}

