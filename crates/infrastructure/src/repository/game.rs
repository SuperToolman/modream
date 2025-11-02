use async_trait::async_trait;
use domain::entity::game::{ActiveModel, Column, Entity as Game, Model as GameModel};
use domain::repository::GameRepository;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    QuerySelect, Set, TransactionTrait,
};

pub struct GameRepositoryImpl {
    db: DatabaseConnection,
}

impl GameRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl GameRepository for GameRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<GameModel>> {
        let game = Game::find_by_id(id).one(&self.db).await?;
        Ok(game)
    }

    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<GameModel>>> {
        // 验证参数
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        // 计算偏移量（page_index 从 1 开始）
        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        // 执行分页查询
        let games = Game::find()
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if games.is_empty() {
            Ok(None)
        } else {
            Ok(Some(games))
        }
    }

    async fn create(&self, game: GameModel) -> anyhow::Result<GameModel> {
        let active_model = ActiveModel {
            id: sea_orm::NotSet,
            create_time: Set(game.create_time),
            update_time: Set(game.update_time),
            title: Set(game.title),
            sub_title: Set(game.sub_title),
            covers: Set(game.covers),
            version: Set(game.version),
            root_path: Set(game.root_path),
            start_paths: Set(game.start_paths),
            start_path_default: Set(game.start_path_default),
            start_item_count: Set(game.start_item_count),
            description: Set(game.description),
            release_date: Set(game.release_date),
            developer: Set(game.developer),
            publisher: Set(game.publisher),
            tabs: Set(game.tabs),
            platform: Set(game.platform),
            byte_size: Set(game.byte_size),
            media_library_id: Set(game.media_library_id),
        };

        let created_game = active_model.insert(&self.db).await?;
        Ok(created_game)
    }

    async fn create_batch(&self, games: Vec<GameModel>) -> anyhow::Result<Vec<GameModel>> {
        if games.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch insert of {} games", games.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut created_games = Vec::new();

        // 分批插入（每批 500 条，避免 SQL 语句过长）
        const BATCH_SIZE: usize = 500;
        let total_batches = (games.len() + BATCH_SIZE - 1) / BATCH_SIZE;

        for (batch_index, chunk) in games.chunks(BATCH_SIZE).enumerate() {
            tracing::debug!(
                "Inserting batch {}/{} ({} games)",
                batch_index + 1,
                total_batches,
                chunk.len()
            );

            // 转换为 ActiveModel
            let active_models: Vec<ActiveModel> = chunk
                .iter()
                .map(|game| ActiveModel {
                    id: sea_orm::NotSet,
                    create_time: Set(game.create_time.clone()),
                    update_time: Set(game.update_time.clone()),
                    title: Set(game.title.clone()),
                    sub_title: Set(game.sub_title.clone()),
                    covers: Set(game.covers.clone()),
                    version: Set(game.version.clone()),
                    root_path: Set(game.root_path.clone()),
                    start_paths: Set(game.start_paths.clone()),
                    start_path_default: Set(game.start_path_default.clone()),
                    start_item_count: Set(game.start_item_count),
                    description: Set(game.description.clone()),
                    release_date: Set(game.release_date.clone()),
                    developer: Set(game.developer.clone()),
                    publisher: Set(game.publisher.clone()),
                    tabs: Set(game.tabs.clone()),
                    platform: Set(game.platform.clone()),
                    byte_size: Set(game.byte_size),
                    media_library_id: Set(game.media_library_id),
                })
                .collect();

            // 批量插入
            for active_model in active_models {
                let created = active_model.insert(&txn).await?;
                created_games.push(created);
            }
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully inserted {} games", created_games.len());
        Ok(created_games)
    }

    async fn update(&self, game: GameModel) -> anyhow::Result<GameModel> {
        let active_model = ActiveModel {
            id: Set(game.id),
            create_time: Set(game.create_time),
            update_time: Set(game.update_time),
            title: Set(game.title),
            sub_title: Set(game.sub_title),
            covers: Set(game.covers),
            version: Set(game.version),
            root_path: Set(game.root_path),
            start_paths: Set(game.start_paths),
            start_path_default: Set(game.start_path_default),
            start_item_count: Set(game.start_item_count),
            description: Set(game.description),
            release_date: Set(game.release_date),
            developer: Set(game.developer),
            publisher: Set(game.publisher),
            tabs: Set(game.tabs),
            platform: Set(game.platform),
            byte_size: Set(game.byte_size),
            media_library_id: Set(game.media_library_id),
        };

        let updated_game = active_model.update(&self.db).await?;
        Ok(updated_game)
    }

    async fn update_batch(&self, games: Vec<GameModel>) -> anyhow::Result<Vec<GameModel>> {
        if games.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch update of {} games", games.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut updated_games = Vec::new();

        for game in games {
            let active_model = ActiveModel {
                id: Set(game.id),
                create_time: Set(game.create_time),
                update_time: Set(game.update_time),
                title: Set(game.title),
                sub_title: Set(game.sub_title),
                covers: Set(game.covers),
                version: Set(game.version),
                root_path: Set(game.root_path),
                start_paths: Set(game.start_paths),
                start_path_default: Set(game.start_path_default),
                start_item_count: Set(game.start_item_count),
                description: Set(game.description),
                release_date: Set(game.release_date),
                developer: Set(game.developer),
                publisher: Set(game.publisher),
                tabs: Set(game.tabs),
                platform: Set(game.platform),
                byte_size: Set(game.byte_size),
                media_library_id: Set(game.media_library_id),
            };

            let updated = active_model.update(&txn).await?;
            updated_games.push(updated);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully updated {} games", updated_games.len());
        Ok(updated_games)
    }

    async fn find_by_media_library_id(
        &self,
        media_library_id: i32,
    ) -> anyhow::Result<Vec<GameModel>> {
        let games = Game::find()
            .filter(Column::MediaLibraryId.eq(media_library_id))
            .all(&self.db)
            .await?;
        Ok(games)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        Game::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_all(&self) -> anyhow::Result<i32> {
        let count = Game::find().count(&self.db).await? as i32;
        Ok(count)
    }

    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32> {
        let count = Game::find()
            .filter(Column::MediaLibraryId.eq(media_library_id))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }
}

