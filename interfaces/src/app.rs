use crate::server;
use axum::Router;
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use infrastructure::repository::{UserRepositoryImpl, MediaLibraryRepositoryImpl, MangaRepositoryImpl, MangaChapterRepositoryImpl, GameRepositoryImpl};
use application::user_service::UserService;
use application::auth_service::AuthService;
use application::media_library_service::MediaLibraryService;
use application::manga_service::MangaService;
use application::game_service::GameService;
use application::image_service::ImageService;

#[derive(Clone)]
pub struct AppState {
    pub user_service: Arc<UserService>,
    pub auth_service: Arc<AuthService>,
    pub media_library_service: Arc<MediaLibraryService>,
    pub manga_service: Arc<MangaService>,
    pub manga_chapter_service: Arc<application::manga_chapter_service::MangaChapterService>,
    pub game_service: Arc<GameService>,
    pub image_service: Arc<ImageService>,
}

impl AppState {
    pub fn new(db: DatabaseConnection) -> AppState {
        // 创建 Repository
        let user_repo = Arc::new(UserRepositoryImpl::new(db.clone()));
        let media_library_repo = Arc::new(MediaLibraryRepositoryImpl::new(db.clone()));
        let manga_repo = Arc::new(MangaRepositoryImpl::new(db.clone()));
        let manga_chapter_repo = Arc::new(MangaChapterRepositoryImpl::new(Arc::new(db.clone())));
        let game_repo = Arc::new(GameRepositoryImpl::new(db));

        // 创建 Application 层的服务
        let user_service = Arc::new(UserService::new(user_repo));
        let auth_service = Arc::new(AuthService::new(user_service.clone()));
        let image_service = Arc::new(ImageService::new(manga_repo.clone(), manga_chapter_repo.clone()));
        let media_library_service = Arc::new(MediaLibraryService::new(media_library_repo, manga_repo.clone(), manga_chapter_repo.clone(), game_repo.clone(), image_service.clone()));
        let manga_service = Arc::new(MangaService::new(manga_repo.clone()));
        let manga_chapter_service = Arc::new(application::manga_chapter_service::MangaChapterService::new(manga_chapter_repo.clone()));
        let game_service = Arc::new(GameService::new(game_repo));

        AppState {
            user_service,
            auth_service,
            media_library_service,
            manga_service,
            manga_chapter_service,
            game_service,
            image_service,
        }
    }
}

pub async fn run(router: Router<AppState>) -> anyhow::Result<()> {
    shared::logger::init(); // 初始化日志系统
    let db = infrastructure::database::init().await?; // 初始化数据库

    let server_config = shared::config::get().server();
    let state = AppState::new(db);
    let server = server::Server::new(server_config);

    tracing::info!("Starting server.....");
    server.start(state, router).await?;
    Ok(())
}
