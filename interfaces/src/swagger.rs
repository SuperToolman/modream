use utoipa::OpenApi;
use application::dto::{LoginRequest, LoginResponse, RegisterRequest, UserInfo, MediaLibraryInfo, MangaInfo, PagedResponse, CreateMediaLibraryRequest, PaginationQuery};
use domain::entity::user::Model as UserModel;
use crate::api::{auth, user, media_library, manga, image};
use crate::api::image::ImageInfo;

/// API 文档
#[derive(OpenApi)]
#[openapi(
    paths(
        auth::login,
        auth::register,
        user::query_all_users,
        media_library::create_media_library,
        media_library::query_all_media_libraries,
        media_library::get_manga_by_media_library,
        manga::get_manga,
        manga::get_manga_paged,
        image::get_manga_images,
        image::get_manga_image,
        image::get_manga_cover,
    ),
    components(
        schemas(
            LoginRequest,
            LoginResponse,
            RegisterRequest,
            UserInfo,
            UserModel,
            CreateMediaLibraryRequest,
            MediaLibraryInfo,
            MangaInfo,
            PagedResponse<MangaInfo>,
            PaginationQuery,
            ImageInfo,
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
        (name = "manga", description = "漫画相关接口"),
        (name = "image", description = "图片相关接口"),
    )
)]
pub struct ApiDoc;

