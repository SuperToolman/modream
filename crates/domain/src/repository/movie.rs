use crate::entity::movie::Model as MovieModel;
use async_trait::async_trait;

/// 电影仓储接口
/// 定义所有电影数据访问操作的抽象接口
#[async_trait]
pub trait MovieRepository: Send + Sync {
    /// 根据 ID 查询电影
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MovieModel>>;

    /// 分页查询电影
    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MovieModel>>>;

    /// 创建新电影
    async fn create(&self, movie: MovieModel) -> anyhow::Result<MovieModel>;

    /// 批量创建电影
    async fn create_batch(&self, movies: Vec<MovieModel>) -> anyhow::Result<Vec<MovieModel>>;

    /// 更新电影
    async fn update(&self, movie: MovieModel) -> anyhow::Result<MovieModel>;

    /// 批量更新电影（使用事务）
    async fn update_batch(&self, movies: Vec<MovieModel>) -> anyhow::Result<Vec<MovieModel>>;

    /// 根据媒体库 ID 查询所有电影
    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MovieModel>>;

    /// 删除电影
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 获取所有电影的总数
    async fn count_all(&self) -> anyhow::Result<i32>;

    /// 根据媒体库 ID 获取电影数量
    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32>;
}

