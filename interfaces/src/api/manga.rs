use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{MangaInfo, PagedResponse, PaginationQuery};
use axum::extract::{State, Path, Query};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;

// region: 根据 ID 查询漫画
#[utoipa::path(
    get,
    path = "/api/manga/{mangaId}",
    tag = "manga",
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<MangaInfo>),
        (status = 404, description = "漫画不存在"),
    )
)]
pub async fn get_manga(
    State(AppState { manga_service, .. }): State<AppState>,
    Path(manga_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let manga = manga_service.find_by_id(manga_id).await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::NotFound)?;

    let manga_info = MangaInfo::from(manga);

    let response = ApiResponse::ok(
        Some("Get manga successful"),
        Some(manga_info),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 分页查询全部漫画
#[utoipa::path(
    get,
    path = "/api/manga",
    tag = "manga",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 10", example = 10),
    ),
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<PagedResponse<MangaInfo>>),
    )
)]
pub async fn get_manga_paged(
    State(AppState { manga_service, .. }): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    // 验证参数
    if params.page_index <= 0 || params.page_size <= 0 {
        return Err(AppError::Biz("page_index and page_size must be greater than 0".to_string()));
    }

    if params.page_size > 100 {
        return Err(AppError::Biz("page_size must be less than or equal to 100".to_string()));
    }

    // 获取总数
    let total = manga_service.count_all().await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 分页查询
    let mangas = manga_service.find_paged(params.page_size, params.page_index).await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .unwrap_or_default();

    // 转换为 DTO
    let manga_infos: Vec<MangaInfo> = mangas
        .into_iter()
        .map(MangaInfo::from)
        .collect();

    // 构建分页响应
    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, manga_infos);

    let response = ApiResponse::ok(
        Some("Get manga list successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion





/// 漫画路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", routing::get(get_manga_paged))
        .route("/{manga_id}", routing::get(get_manga))
}

