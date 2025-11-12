use async_trait::async_trait;
use domain::entity::movie::{ActiveModel, Column, Entity as Movie, Model as MovieModel};
use domain::repository::MovieRepository;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    QuerySelect, Set, TransactionTrait,
};

pub struct MovieRepositoryImpl {
    db: DatabaseConnection,
}

impl MovieRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl MovieRepository for MovieRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MovieModel>> {
        let movie = Movie::find_by_id(id).one(&self.db).await?;
        Ok(movie)
    }

    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MovieModel>>> {
        // 验证参数
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        // 计算偏移量（page_index 从 1 开始）
        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        // 执行分页查询
        let movies = Movie::find()
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if movies.is_empty() {
            Ok(None)
        } else {
            Ok(Some(movies))
        }
    }

    async fn create(&self, movie: MovieModel) -> anyhow::Result<MovieModel> {
        let active_model = ActiveModel {
            id: sea_orm::NotSet,
            create_time: Set(movie.create_time),
            update_time: Set(movie.update_time),
            title: Set(movie.title),
            original_title: Set(movie.original_title),
            description: Set(movie.description),
            path: Set(movie.path),
            byte_size: Set(movie.byte_size),
            extension: Set(movie.extension),
            duration: Set(movie.duration),
            width: Set(movie.width),
            height: Set(movie.height),
            resolution: Set(movie.resolution),
            release_date: Set(movie.release_date),
            rating: Set(movie.rating),
            votes: Set(movie.votes),
            genres: Set(movie.genres),
            actors: Set(movie.actors),
            directors: Set(movie.directors),
            writers: Set(movie.writers),
            producers: Set(movie.producers),
            tags: Set(movie.tags),
            poster_urls: Set(movie.poster_urls),
            cover: Set(movie.cover),
            media_library_id: Set(movie.media_library_id),
        };

        let created_movie = active_model.insert(&self.db).await?;
        Ok(created_movie)
    }

    async fn create_batch(&self, movies: Vec<MovieModel>) -> anyhow::Result<Vec<MovieModel>> {
        if movies.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch insert of {} movies", movies.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut created_movies = Vec::new();

        // 分批插入（每批 500 条，避免 SQL 语句过长）
        const BATCH_SIZE: usize = 500;
        let total_batches = (movies.len() + BATCH_SIZE - 1) / BATCH_SIZE;

        for (batch_index, chunk) in movies.chunks(BATCH_SIZE).enumerate() {
            tracing::debug!(
                "Inserting batch {}/{} ({} movies)",
                batch_index + 1,
                total_batches,
                chunk.len()
            );

            for movie in chunk {
                let active_model = ActiveModel {
                    id: sea_orm::NotSet,
                    create_time: Set(movie.create_time.clone()),
                    update_time: Set(movie.update_time.clone()),
                    title: Set(movie.title.clone()),
                    original_title: Set(movie.original_title.clone()),
                    description: Set(movie.description.clone()),
                    path: Set(movie.path.clone()),
                    byte_size: Set(movie.byte_size),
                    extension: Set(movie.extension.clone()),
                    duration: Set(movie.duration),
                    width: Set(movie.width),
                    height: Set(movie.height),
                    resolution: Set(movie.resolution.clone()),
                    release_date: Set(movie.release_date.clone()),
                    rating: Set(movie.rating),
                    votes: Set(movie.votes),
                    genres: Set(movie.genres.clone()),
                    actors: Set(movie.actors.clone()),
                    directors: Set(movie.directors.clone()),
                    writers: Set(movie.writers.clone()),
                    producers: Set(movie.producers.clone()),
                    tags: Set(movie.tags.clone()),
                    poster_urls: Set(movie.poster_urls.clone()),
                    cover: Set(movie.cover.clone()),
                    media_library_id: Set(movie.media_library_id),
                };

                let created_movie = active_model.insert(&txn).await?;
                created_movies.push(created_movie);
            }
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully inserted {} movies", created_movies.len());
        Ok(created_movies)
    }

    async fn update(&self, movie: MovieModel) -> anyhow::Result<MovieModel> {
        let active_model = ActiveModel {
            id: Set(movie.id),
            create_time: Set(movie.create_time),
            update_time: Set(movie.update_time),
            title: Set(movie.title),
            original_title: Set(movie.original_title),
            description: Set(movie.description),
            path: Set(movie.path),
            byte_size: Set(movie.byte_size),
            extension: Set(movie.extension),
            duration: Set(movie.duration),
            width: Set(movie.width),
            height: Set(movie.height),
            resolution: Set(movie.resolution),
            release_date: Set(movie.release_date),
            rating: Set(movie.rating),
            votes: Set(movie.votes),
            genres: Set(movie.genres),
            actors: Set(movie.actors),
            directors: Set(movie.directors),
            writers: Set(movie.writers),
            producers: Set(movie.producers),
            tags: Set(movie.tags),
            poster_urls: Set(movie.poster_urls),
            cover: Set(movie.cover),
            media_library_id: Set(movie.media_library_id),
        };

        let updated_movie = active_model.update(&self.db).await?;
        Ok(updated_movie)
    }

    async fn update_batch(&self, movies: Vec<MovieModel>) -> anyhow::Result<Vec<MovieModel>> {
        if movies.is_empty() {
            return Ok(Vec::new());
        }

        tracing::info!("Starting batch update of {} movies", movies.len());

        // 开启事务
        let txn = self.db.begin().await?;
        let mut updated_movies = Vec::new();

        for movie in movies {
            let active_model = ActiveModel {
                id: Set(movie.id),
                create_time: Set(movie.create_time.clone()),
                update_time: Set(movie.update_time.clone()),
                title: Set(movie.title.clone()),
                original_title: Set(movie.original_title.clone()),
                description: Set(movie.description.clone()),
                path: Set(movie.path.clone()),
                byte_size: Set(movie.byte_size),
                extension: Set(movie.extension.clone()),
                duration: Set(movie.duration),
                width: Set(movie.width),
                height: Set(movie.height),
                resolution: Set(movie.resolution.clone()),
                release_date: Set(movie.release_date.clone()),
                rating: Set(movie.rating),
                votes: Set(movie.votes),
                genres: Set(movie.genres.clone()),
                actors: Set(movie.actors.clone()),
                directors: Set(movie.directors.clone()),
                writers: Set(movie.writers.clone()),
                producers: Set(movie.producers.clone()),
                tags: Set(movie.tags.clone()),
                poster_urls: Set(movie.poster_urls.clone()),
                cover: Set(movie.cover.clone()),
                media_library_id: Set(movie.media_library_id),
            };

            let updated_movie = active_model.update(&txn).await?;
            updated_movies.push(updated_movie);
        }

        // 提交事务
        txn.commit().await?;

        tracing::info!("Successfully updated {} movies", updated_movies.len());
        Ok(updated_movies)
    }

    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MovieModel>> {
        let movies = Movie::find()
            .filter(Column::MediaLibraryId.eq(media_library_id))
            .all(&self.db)
            .await?;
        Ok(movies)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        Movie::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_all(&self) -> anyhow::Result<i32> {
        let count = Movie::find().count(&self.db).await? as i32;
        Ok(count)
    }

    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32> {
        let count = Movie::find()
            .filter(Column::MediaLibraryId.eq(media_library_id))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }
}

