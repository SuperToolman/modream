use domain::entity::manga_chapter::{ActiveModel, Column, Entity as MangaChapter, Model as MangaChapterModel};
use domain::repository::MangaChapterRepository;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set, TransactionTrait};
use std::sync::Arc;

/// 漫画章节仓储实现
pub struct MangaChapterRepositoryImpl {
    db: Arc<DatabaseConnection>,
}

impl MangaChapterRepositoryImpl {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl MangaChapterRepository for MangaChapterRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MangaChapterModel>> {
        let chapter = MangaChapter::find_by_id(id).one(&*self.db).await?;
        Ok(chapter)
    }

    async fn find_by_manga_id(&self, manga_id: i32) -> anyhow::Result<Vec<MangaChapterModel>> {
        let chapters = MangaChapter::find()
            .filter(Column::MangaId.eq(manga_id))
            .all(&*self.db)
            .await?;
        Ok(chapters)
    }

    async fn create(&self, chapter: MangaChapterModel) -> anyhow::Result<MangaChapterModel> {
        let active_model = ActiveModel {
            id: sea_orm::NotSet,
            create_time: Set(chapter.create_time),
            update_time: Set(chapter.update_time),
            manga_id: Set(chapter.manga_id),
            chapter_number: Set(chapter.chapter_number),
            title: Set(chapter.title),
            path: Set(chapter.path),
            page_count: Set(chapter.page_count),
            byte_size: Set(chapter.byte_size),
            cover: Set(chapter.cover),
            image_paths: Set(chapter.image_paths),
        };

        let created_chapter = active_model.insert(&*self.db).await?;
        Ok(created_chapter)
    }

    async fn create_batch(&self, chapters: Vec<MangaChapterModel>) -> anyhow::Result<Vec<MangaChapterModel>> {
        if chapters.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch insert of {} chapters", chapters.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut created_chapters = Vec::new();

        // 分批插入（每批 500 条）
        const BATCH_SIZE: usize = 500;
        let total_batches = (chapters.len() + BATCH_SIZE - 1) / BATCH_SIZE;

        for (batch_index, chunk) in chapters.chunks(BATCH_SIZE).enumerate() {
            tracing::debug!(
                "Inserting batch {}/{} ({} chapters)",
                batch_index + 1,
                total_batches,
                chunk.len()
            );

            // 转换为 ActiveModel
            let active_models: Vec<ActiveModel> = chunk
                .iter()
                .map(|chapter| ActiveModel {
                    id: sea_orm::NotSet,
                    create_time: Set(chapter.create_time.clone()),
                    update_time: Set(chapter.update_time.clone()),
                    manga_id: Set(chapter.manga_id),
                    chapter_number: Set(chapter.chapter_number),
                    title: Set(chapter.title.clone()),
                    path: Set(chapter.path.clone()),
                    page_count: Set(chapter.page_count),
                    byte_size: Set(chapter.byte_size),
                    cover: Set(chapter.cover.clone()),
                    image_paths: Set(chapter.image_paths.clone()),
                })
                .collect();

            // 批量插入
            let batch_created = MangaChapter::insert_many(active_models)
                .exec_with_returning(&txn)
                .await?;

            created_chapters.extend(batch_created);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully batch inserted {} chapters", created_chapters.len());
        Ok(created_chapters)
    }

    async fn update(&self, chapter: MangaChapterModel) -> anyhow::Result<MangaChapterModel> {
        let active_model = ActiveModel {
            id: Set(chapter.id),
            create_time: Set(chapter.create_time),
            update_time: Set(chapter.update_time),
            manga_id: Set(chapter.manga_id),
            chapter_number: Set(chapter.chapter_number),
            title: Set(chapter.title),
            path: Set(chapter.path),
            page_count: Set(chapter.page_count),
            byte_size: Set(chapter.byte_size),
            cover: Set(chapter.cover),
            image_paths: Set(chapter.image_paths),
        };

        let updated_chapter = active_model.update(&*self.db).await?;
        Ok(updated_chapter)
    }

    async fn update_batch(&self, chapters: Vec<MangaChapterModel>) -> anyhow::Result<Vec<MangaChapterModel>> {
        if chapters.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch update of {} chapters", chapters.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut updated_chapters = Vec::new();

        // 在事务中逐个更新
        for chapter in chapters {
            let active_model = ActiveModel {
                id: Set(chapter.id),
                create_time: Set(chapter.create_time),
                update_time: Set(chapter.update_time),
                manga_id: Set(chapter.manga_id),
                chapter_number: Set(chapter.chapter_number),
                title: Set(chapter.title),
                path: Set(chapter.path),
                page_count: Set(chapter.page_count),
                byte_size: Set(chapter.byte_size),
                cover: Set(chapter.cover),
                image_paths: Set(chapter.image_paths),
            };

            let updated_chapter = active_model.update(&txn).await?;
            updated_chapters.push(updated_chapter);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully batch updated {} chapters", updated_chapters.len());
        Ok(updated_chapters)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        MangaChapter::delete_by_id(id).exec(&*self.db).await?;
        Ok(())
    }

    async fn delete_by_manga_id(&self, manga_id: i32) -> anyhow::Result<()> {
        MangaChapter::delete_many()
            .filter(Column::MangaId.eq(manga_id))
            .exec(&*self.db)
            .await?;
        Ok(())
    }
}

