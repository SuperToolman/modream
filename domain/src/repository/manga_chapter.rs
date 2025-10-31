use crate::entity::manga_chapter::Model as MangaChapterModel;
use async_trait::async_trait;

/// 漫画章节仓储接口
#[async_trait]
pub trait MangaChapterRepository: Send + Sync {
    /// 根据 ID 查询章节
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MangaChapterModel>>;

    /// 根据漫画 ID 查询所有章节
    async fn find_by_manga_id(&self, manga_id: i32) -> anyhow::Result<Vec<MangaChapterModel>>;

    /// 创建新章节
    async fn create(&self, chapter: MangaChapterModel) -> anyhow::Result<MangaChapterModel>;

    /// 批量创建章节
    async fn create_batch(&self, chapters: Vec<MangaChapterModel>) -> anyhow::Result<Vec<MangaChapterModel>>;

    /// 更新章节
    async fn update(&self, chapter: MangaChapterModel) -> anyhow::Result<MangaChapterModel>;

    /// 批量更新章节
    async fn update_batch(&self, chapters: Vec<MangaChapterModel>) -> anyhow::Result<Vec<MangaChapterModel>>;

    /// 删除章节
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 根据漫画 ID 删除所有章节
    async fn delete_by_manga_id(&self, manga_id: i32) -> anyhow::Result<()>;
}

