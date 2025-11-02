use utoipa::OpenApi;
use application::dto::{
    LoginRequest, LoginResponse, RegisterRequest, UserInfo,
    MediaLibraryInfo, MangaInfo, MangaChapterInfo, GameInfo,
    PagedResponse, CreateMediaLibraryRequest, PaginationQuery,
    FixPasswordsResponse, ImageInfo, OptimizedImageListResponse,
    OptimizedChapterImageListResponse,
    ScanGamesRequest, LaunchGameRequest, UpdateDefaultStartPathRequest,
};
use application::dto::config::{
    GameboxConfigResponse, UpdateGameboxConfigRequest,
    IgdbConfigResponse, DlsiteConfigResponse, SteamdbConfigResponse,
    UpdateIgdbConfigRequest, UpdateDlsiteConfigRequest, UpdateSteamdbConfigRequest
};
use domain::entity::user::Model as UserModel;
use crate::api::{auth, user, media_library, manga, manga_chapter, game, config};

/// API 文档
#[derive(OpenApi)]
#[openapi(
    paths(
        auth::login,
        auth::register,
        user::query_all_users,
        user::fix_passwords,
        media_library::create_media_library,
        media_library::query_all_media_libraries,
        media_library::get_manga_by_media_library,
        manga::get_manga,
        manga::get_manga_paged,
        manga::get_manga_images,
        manga::get_manga_image,
        manga::get_manga_cover,
        manga_chapter::get_manga_chapters,
        manga_chapter::get_chapter_images,
        manga_chapter::get_chapter_image,
        manga_chapter::get_chapter_cover,
        game::get_game,
        game::get_games_paged,
        game::scan_games,
        game::delete_game,
        game::get_games_by_media_library,
        game::launch_game,
        game::update_default_start_path,
        config::get_config,
        config::update_config,
        config::get_gamebox_config,
        config::update_gamebox_config,
    ),
    components(
        schemas(
            FixPasswordsResponse,
            LoginRequest,
            LoginResponse,
            RegisterRequest,
            UserInfo,
            UserModel,
            CreateMediaLibraryRequest,
            MediaLibraryInfo,
            MangaInfo,
            MangaChapterInfo,
            OptimizedImageListResponse,
            OptimizedChapterImageListResponse,
            GameInfo,
            PagedResponse<MangaInfo>,
            PagedResponse<GameInfo>,
            PaginationQuery,
            ImageInfo,
            ScanGamesRequest,
            LaunchGameRequest,
            UpdateDefaultStartPathRequest,
            GameboxConfigResponse,
            UpdateGameboxConfigRequest,
            IgdbConfigResponse,
            DlsiteConfigResponse,
            SteamdbConfigResponse,
            UpdateIgdbConfigRequest,
            UpdateDlsiteConfigRequest,
            UpdateSteamdbConfigRequest,
        )
    ),
    info(
        title = "Web API",
        description = "基于 DDD 架构的 Web API",
        version = "1.0.0",
        contact(
            name = "API Support",
            url = "https://example.com"
        ),
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers(
        (url = "http://127.0.0.1:8080", description = "Local server"),
    ),
    tags(
        (name = "auth", description = "认证相关接口"),
        (name = "user", description = "用户相关接口"),
        (name = "media_library", description = "媒体库相关接口"),
        (name = "manga", description = "漫画相关接口（包括图片）"),
        (name = "manga_chapter", description = "漫画章节相关接口（包括图片）"),
        (name = "game", description = "游戏相关接口"),
        (name = "config", description = "配置相关接口"),
    )
)]
pub struct ApiDoc;

