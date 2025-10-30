use crate::entity::game::Model as GameModel;
use async_trait::async_trait;

/// 游戏仓储接口
/// 定义所有游戏数据访问操作的抽象接口
#[async_trait]
pub trait GameRepository: Send + Sync {
    /// 根据 ID 查询游戏
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<GameModel>>;

    /// 分页查询游戏
    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<GameModel>>>;

    /// 创建新游戏
    async fn create(&self, game: GameModel) -> anyhow::Result<GameModel>;

    /// 批量创建游戏
    async fn create_batch(&self, games: Vec<GameModel>) -> anyhow::Result<Vec<GameModel>>;

    /// 更新游戏
    async fn update(&self, game: GameModel) -> anyhow::Result<GameModel>;

    /// 批量更新游戏（使用事务）
    async fn update_batch(&self, games: Vec<GameModel>) -> anyhow::Result<Vec<GameModel>>;

    /// 根据媒体库 ID 查询所有游戏
    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<GameModel>>;

    /// 删除游戏
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 获取所有游戏的总数
    async fn count_all(&self) -> anyhow::Result<i32>;

    /// 根据媒体库 ID 获取游戏数量
    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32>;
}

