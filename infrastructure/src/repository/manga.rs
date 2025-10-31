use async_trait::async_trait;
use domain::entity::manga::{ActiveModel, Entity as Manga, Model as MangaModel};
use domain::repository::MangaRepository;
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, Set, ColumnTrait, QueryFilter, QuerySelect, PaginatorTrait, TransactionTrait};

pub struct MangaRepositoryImpl {
    db: DatabaseConnection,
}

impl MangaRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl MangaRepository for MangaRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MangaModel>> {
        let manga = Manga::find_by_id(id).one(&self.db).await?;
        Ok(manga)
    }

    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MangaModel>>> {
        // 验证参数
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        // 计算偏移量（page_index 从 1 开始）
        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        // 执行分页查询
        let mangas = Manga::find()
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if mangas.is_empty() {
            Ok(None)
        } else {
            Ok(Some(mangas))
        }
    }

    async fn create(&self, manga: MangaModel) -> anyhow::Result<MangaModel> {
        let active_model = ActiveModel {
            id: sea_orm::NotSet,
            create_time: Set(manga.create_time),
            update_time: Set(manga.update_time),
            title: Set(manga.title),
            description: Set(manga.description),
            path: Set(manga.path),
            page_count: Set(manga.page_count),
            byte_size: Set(manga.byte_size),
            manga_type_string: Set(manga.manga_type_string),
            author_id: Set(manga.author_id),
            media_library_id: Set(manga.media_library_id),
            cover: Set(manga.cover),
            has_chapters: Set(manga.has_chapters),
            image_paths: Set(manga.image_paths),
        };

        let created_manga = active_model.insert(&self.db).await?;
        Ok(created_manga)
    }

    async fn create_batch(&self, mangas: Vec<MangaModel>) -> anyhow::Result<Vec<MangaModel>> {
        if mangas.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch insert of {} mangas", mangas.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut created_mangas = Vec::new();

        // 分批插入（每批 500 条，避免 SQL 语句过长）
        const BATCH_SIZE: usize = 500;
        let total_batches = (mangas.len() + BATCH_SIZE - 1) / BATCH_SIZE;

        for (batch_index, chunk) in mangas.chunks(BATCH_SIZE).enumerate() {
            tracing::debug!(
                "Inserting batch {}/{} ({} mangas)",
                batch_index + 1,
                total_batches,
                chunk.len()
            );

            // 转换为 ActiveModel
            let active_models: Vec<ActiveModel> = chunk
                .iter()
                .map(|manga| ActiveModel {
                    id: sea_orm::NotSet,
                    create_time: Set(manga.create_time.clone()),
                    update_time: Set(manga.update_time.clone()),
                    title: Set(manga.title.clone()),
                    description: Set(manga.description.clone()),
                    path: Set(manga.path.clone()),
                    page_count: Set(manga.page_count),
                    byte_size: Set(manga.byte_size),
                    manga_type_string: Set(manga.manga_type_string.clone()),
                    author_id: Set(manga.author_id),
                    media_library_id: Set(manga.media_library_id),
                    cover: Set(manga.cover.clone()),
                    has_chapters: Set(manga.has_chapters),
                    image_paths: Set(manga.image_paths.clone()),
                })
                .collect();

            // 使用 SeaORM 2.0 的 insert_many + exec_with_returning
            // 直接返回插入的记录，无需额外查询
            let batch_created = Manga::insert_many(active_models)
                .exec_with_returning(&txn)
                .await?;

            created_mangas.extend(batch_created);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully batch inserted {} mangas", created_mangas.len());
        Ok(created_mangas)
    }

    async fn update(&self, manga: MangaModel) -> anyhow::Result<MangaModel> {
        let active_model = ActiveModel {
            id: Set(manga.id),
            create_time: Set(manga.create_time),
            update_time: Set(manga.update_time),
            title: Set(manga.title),
            description: Set(manga.description),
            path: Set(manga.path),
            page_count: Set(manga.page_count),
            byte_size: Set(manga.byte_size),
            manga_type_string: Set(manga.manga_type_string),
            author_id: Set(manga.author_id),
            media_library_id: Set(manga.media_library_id),
            cover: Set(manga.cover),
            has_chapters: Set(manga.has_chapters),
            image_paths: Set(manga.image_paths),
        };

        let updated_manga = active_model.update(&self.db).await?;
        Ok(updated_manga)
    }

    async fn update_batch(&self, mangas: Vec<MangaModel>) -> anyhow::Result<Vec<MangaModel>> {
        if mangas.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch update of {} mangas", mangas.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut updated_mangas = Vec::new();

        // 在事务中逐个更新（SQLite 不支持批量 UPDATE）
        for manga in mangas {
            let active_model = ActiveModel {
                id: Set(manga.id),
                create_time: Set(manga.create_time),
                update_time: Set(manga.update_time),
                title: Set(manga.title),
                description: Set(manga.description),
                path: Set(manga.path),
                page_count: Set(manga.page_count),
                byte_size: Set(manga.byte_size),
                manga_type_string: Set(manga.manga_type_string),
                author_id: Set(manga.author_id),
                media_library_id: Set(manga.media_library_id),
                cover: Set(manga.cover),
                has_chapters: Set(manga.has_chapters),
                image_paths: Set(manga.image_paths),
            };

            let updated_manga = active_model.update(&txn).await?;
            updated_mangas.push(updated_manga);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully batch updated {} mangas", updated_mangas.len());
        Ok(updated_mangas)
    }

    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MangaModel>> {
        let mangas = Manga::find()
            .filter(domain::entity::manga::Column::MediaLibraryId.eq(media_library_id))
            .all(&self.db)
            .await?;
        Ok(mangas)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        Manga::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_all(&self) -> anyhow::Result<i32> {
        let count = Manga::find().count(&self.db).await?;
        Ok(count as i32)
    }
}
