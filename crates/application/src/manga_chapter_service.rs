use domain::repository::MangaChapterRepository;
use std::sync::Arc;

/// 漫画章节服务
pub struct MangaChapterService {
    repo: Arc<dyn MangaChapterRepository>,
}

impl MangaChapterService {
    /// 创建新的章节服务实例
    pub fn new(repo: Arc<dyn MangaChapterRepository>) -> Self {
        Self { repo }
    }

    /// 根据 ID 查询章节
    pub async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<domain::entity::manga_chapter::Model>> {
        self.repo.find_by_id(id).await
    }

    /// 根据漫画 ID 查询所有章节（按章节号排序）
    pub async fn find_by_manga_id(&self, manga_id: i32) -> anyhow::Result<Vec<domain::entity::manga_chapter::Model>> {
        let mut chapters = self.repo.find_by_manga_id(manga_id).await?;
        
        // 按章节号排序
        chapters.sort_by(|a, b| {
            a.chapter_number
                .partial_cmp(&b.chapter_number)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        
        Ok(chapters)
    }
}

