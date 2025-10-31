use domain::repository::MangaRepository;
use std::sync::Arc;
use crate::dto::CreateMangaRequest;

/// 漫画服务
pub struct MangaService {
    repo: Arc<dyn MangaRepository>,
}

impl MangaService {
    /// 创建新的漫画服务实例
    pub fn new(repo: Arc<dyn MangaRepository>) -> Self {
        Self { repo }
    }

    /// 根据 ID 查询漫画
    pub async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<domain::entity::manga::Model>> {
        self.repo.find_by_id(id).await
    }

    /// 根据媒体库 ID 查询所有漫画
    pub async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<domain::entity::manga::Model>> {
        self.repo.find_by_media_library_id(media_library_id).await
    }

    /// 分页查询所有漫画
    pub async fn find_paged(&self, page_size: i32, page_index: i32) -> anyhow::Result<Option<Vec<domain::entity::manga::Model>>> {
        self.repo.find_by_paged(page_size, page_index).await
    }

    /// 获取所有漫画的总数
    pub async fn count_all(&self) -> anyhow::Result<i32> {
        self.repo.count_all().await
    }

    /// 创建新漫画
    pub async fn create(&self, req: CreateMangaRequest) -> anyhow::Result<domain::entity::manga::Model> {
        // 验证输入
        if req.title.is_empty() {
            return Err(anyhow::anyhow!("Title is required"));
        }

        if req.path.is_empty() {
            return Err(anyhow::anyhow!("Path is required"));
        }

        // 创建新漫画
        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let manga_model = domain::entity::manga::Model {
            id: 0, // 数据库会自动生成
            title: req.title,
            description: req.description,
            path: req.path,
            page_count: req.page_count,
            byte_size: req.byte_size,
            manga_type_string: req.manga_type_string,
            author_id: req.author_id,
            media_library_id: req.media_library_id,
            cover: req.cover,
            has_chapters: false, // 默认为单文件夹漫画
            create_time: now.clone(),
            update_time: now,
        };

        let manga = self.repo.create(manga_model).await?;
        Ok(manga)
    }

    /// 批量创建漫画
    pub async fn create_batch(&self, reqs: Vec<CreateMangaRequest>) -> anyhow::Result<Vec<domain::entity::manga::Model>> {
        let mangas: Vec<domain::entity::manga::Model> = reqs
            .into_iter()
            .map(|req| {
                let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
                domain::entity::manga::Model {
                    id: 0,
                    title: req.title,
                    description: req.description,
                    path: req.path,
                    page_count: req.page_count,
                    byte_size: req.byte_size,
                    manga_type_string: req.manga_type_string,
                    author_id: req.author_id,
                    media_library_id: req.media_library_id,
                    cover: req.cover,
                    has_chapters: false, // 默认为单文件夹漫画
                    create_time: now.clone(),
                    update_time: now,
                }
            })
            .collect();

        self.repo.create_batch(mangas).await
    }
}
