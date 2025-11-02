use domain::repository::GameRepository;
use std::sync::Arc;
use crate::dto::CreateGameRequest;

/// 游戏服务
pub struct GameService {
    repo: Arc<dyn GameRepository>,
}

impl GameService {
    /// 创建新的游戏服务实例
    pub fn new(repo: Arc<dyn GameRepository>) -> Self {
        Self { repo }
    }

    /// 根据 ID 查询游戏
    pub async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<domain::entity::game::Model>> {
        self.repo.find_by_id(id).await
    }

    /// 根据媒体库 ID 查询所有游戏
    pub async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<domain::entity::game::Model>> {
        self.repo.find_by_media_library_id(media_library_id).await
    }

    /// 分页查询所有游戏
    pub async fn find_paged(&self, page_size: i32, page_index: i32) -> anyhow::Result<Option<Vec<domain::entity::game::Model>>> {
        self.repo.find_by_paged(page_size, page_index).await
    }

    /// 获取所有游戏的总数
    pub async fn count_all(&self) -> anyhow::Result<i32> {
        self.repo.count_all().await
    }

    /// 创建新游戏
    pub async fn create(&self, req: CreateGameRequest) -> anyhow::Result<domain::entity::game::Model> {
        // 使用领域实体的工厂方法创建游戏
        let game_model = domain::entity::game::Model::new(
            req.title,
            req.root_path,
            req.start_paths,
            req.release_date,
            req.media_library_id,
        )?;

        // 保存到数据库
        let game = self.repo.create(game_model).await?;
        Ok(game)
    }

    /// 批量创建游戏
    pub async fn create_batch(&self, reqs: Vec<CreateGameRequest>) -> anyhow::Result<Vec<domain::entity::game::Model>> {
        let games: Vec<domain::entity::game::Model> = reqs
            .into_iter()
            .map(|req| {
                domain::entity::game::Model::new(
                    req.title,
                    req.root_path,
                    req.start_paths,
                    req.release_date,
                    req.media_library_id,
                )
            })
            .collect::<Result<Vec<_>, _>>()?;

        self.repo.create_batch(games).await
    }

    /// 扫描游戏文件夹并创建游戏记录
    ///
    /// # 参数
    /// - `path`: 要扫描的根路径
    /// - `providers`: 游戏数据库提供者列表（如 "IGDB,DLSITE,STEAMDB"）
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `anyhow::Result<Vec<domain::entity::game::Model>>` - 创建的游戏实体列表
    ///
    /// # 流程
    /// 1. 使用 gamebox 库扫描游戏文件夹
    /// 2. 将 GameInfo 转换为 domain::entity::game::Model
    /// 3. 批量保存到数据库
    #[cfg(feature = "gamebox")]
    pub async fn scan_and_create(
        &self,
        path: &str,
        providers: &str,
        media_library_id: i32,
    ) -> anyhow::Result<Vec<domain::entity::game::Model>> {
        tracing::info!(
            "Scanning games in path: {}, providers: {}, media_library_id: {}",
            path,
            providers,
            media_library_id
        );

        // 使用 infrastructure 层的扫描功能
        let game_infos = infrastructure::file_scanner::scan_game_folders(path, providers)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to scan games: {}", e))?;
        
        tracing::info!("Found {} games from scanner", game_infos.len());

        // 转换为领域实体
        let games: Vec<domain::entity::game::Model> = game_infos
            .into_iter()
            .map(|info| domain::entity::game::Model::from_game_info(info, media_library_id))
            .collect::<Result<Vec<_>, _>>()?;

        tracing::info!("Converted {} games to domain entities", games.len());

        // 批量保存到数据库
        let saved_games = self.repo.create_batch(games).await?;
        
        tracing::info!("Successfully saved {} games to database", saved_games.len());
        
        Ok(saved_games)
    }

    /// 更新游戏信息
    pub async fn update(&self, game: domain::entity::game::Model) -> anyhow::Result<domain::entity::game::Model> {
        self.repo.update(game).await
    }

    /// 批量更新游戏信息
    pub async fn update_batch(&self, games: Vec<domain::entity::game::Model>) -> anyhow::Result<Vec<domain::entity::game::Model>> {
        self.repo.update_batch(games).await
    }

    /// 删除游戏
    pub async fn delete(&self, id: i32) -> anyhow::Result<()> {
        self.repo.delete(id).await
    }

    /// 根据媒体库 ID 统计游戏数量
    pub async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32> {
        self.repo.count_by_media_library_id(media_library_id).await
    }
}

