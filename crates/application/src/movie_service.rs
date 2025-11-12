use domain::repository::MovieRepository;
use std::sync::Arc;

/// 电影服务 - 处理电影相关的业务逻辑
pub struct MovieService {
    repo: Arc<dyn MovieRepository>,
}

impl MovieService {
    /// 创建新的电影服务实例
    pub fn new(repo: Arc<dyn MovieRepository>) -> Self {
        Self { repo }
    }

    /// 根据 ID 查询电影
    pub async fn get_by_id(&self, id: i32) -> anyhow::Result<domain::entity::movie::Model> {
        self.repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Movie not found with id: {}", id))
    }

    /// 根据媒体库 ID 查询所有电影
    pub async fn get_by_media_library_id(
        &self,
        media_library_id: i32,
    ) -> anyhow::Result<Vec<domain::entity::movie::Model>> {
        self.repo.find_by_media_library_id(media_library_id).await
    }

    /// 分页查询所有电影
    pub async fn get_paged(
        &self,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<domain::entity::movie::Model>, i32)> {
        let movies = self
            .repo
            .find_by_paged(page_size, page_index)
            .await?
            .unwrap_or_default();

        let total = self.repo.count_all().await?;

        Ok((movies, total))
    }

    /// 获取所有电影的总数
    pub async fn count_all(&self) -> anyhow::Result<i32> {
        self.repo.count_all().await
    }

    /// 删除电影
    pub async fn delete(&self, id: i32) -> anyhow::Result<()> {
        // 先检查电影是否存在
        let _movie = self.get_by_id(id).await?;

        // 删除电影
        self.repo.delete(id).await?;

        tracing::info!("Deleted movie with id: {}", id);

        Ok(())
    }

    /// 获取电影视频文件路径（用于流式传输）
    pub async fn get_movie_video_path(&self, id: i32) -> anyhow::Result<String> {
        let movie = self.get_by_id(id).await?;
        Ok(movie.path)
    }
}

