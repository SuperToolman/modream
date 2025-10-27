use crate::entity::manga::Model as MangaModel;
use async_trait::async_trait;

/// 漫画仓储接口
/// 定义所有漫画数据访问操作的抽象接口
#[async_trait]
pub trait MangaRepository: Send + Sync {
    /// 根据 ID 查询漫画
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MangaModel>>;

    /// 分页查询漫画
    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MangaModel>>>;

    /// 创建新漫画
    async fn create(&self, manga: MangaModel) -> anyhow::Result<MangaModel>;

    /// 批量创建漫画
    async fn create_batch(&self, mangas: Vec<MangaModel>) -> anyhow::Result<Vec<MangaModel>>;

    /// 更新漫画
    async fn update(&self, manga: MangaModel) -> anyhow::Result<MangaModel>;

    /// 批量更新漫画（使用事务）
    async fn update_batch(&self, mangas: Vec<MangaModel>) -> anyhow::Result<Vec<MangaModel>>;

    /// 根据媒体库 ID 查询所有漫画
    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MangaModel>>;

    /// 获取所有漫画的总数
    async fn count_all(&self) -> anyhow::Result<i32>;
}
