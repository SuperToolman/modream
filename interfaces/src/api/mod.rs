use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::swagger::ApiDoc;
use axum::{
    extract::MatchedPath,
    http::Request,
    middleware::Next,
    body::Body,
    Router,
};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod auth;
pub mod user;
pub mod media_library;
pub mod manga;
pub mod image;

/// 请求日志中间件 - 记录所有请求的详细信息
async fn log_request(
    matched_path: Option<MatchedPath>,
    req: Request<Body>,
    next: Next,
) -> axum::response::Response {
    let method = req.method().clone();
    let uri = req.uri().clone();
    let path = matched_path.as_ref().map(|p| p.as_str()).unwrap_or("unknown");

    tracing::debug!(
        method = %method,
        uri = %uri,
        matched_path = path,
        "[📨 Incoming request] "
    );

    let response = next.run(req).await;

    tracing::debug!(
        method = %method,
        uri = %uri,
        matched_path = path,
        status = %response.status(),
        "[✅ Request completed] "
    );

    response
}

pub fn create_router() -> Router<AppState> {
    let openapi = ApiDoc::openapi();

    // 配置 CORS - 允许所有来源、方法和头
    let cors = CorsLayer::permissive();

    Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", openapi))
        .nest(
            "/api", // 用/api作为前缀
            Router::new()
                .nest("/users", user::create_router())
                .nest("/auth", auth::create_router())
                .nest("/media_libraries", media_library::routes())
                .nest("/manga", manga::routes())
                .nest("/manga", image::routes()),
        )
        .fallback(async || -> ApiResult<()> {
            // tracing::warn!(
            //     "🚫 Fallback triggered - Route not found (404)"
            // );
            Err(AppError::NotFound)
        })
        .method_not_allowed_fallback(async || -> ApiResult<()> {
            // tracing::warn!(
            //     "🚫 Method not allowed fallback triggered (405)"
            // );
            Err(AppError::MethodNotAllowed)
        })
        .layer(cors)
        .layer(axum::middleware::from_fn(log_request))
}