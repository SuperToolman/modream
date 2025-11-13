use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{CreateMediaLibraryRequest, MediaLibraryInfo, MangaInfo, ScanTaskInfo};
use axum::extract::{State, Path};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;

// region: 创建本地媒体库
#[utoipa::path(
    post,
    path = "/api/media_libraries/local",
    tag = "media_library",
    request_body = CreateMediaLibraryRequest,
    responses(
        (status = 201, description = "Media library created successfully", body = ApiResponse<MediaLibraryInfo>),
        (status = 400, description = "Bad request"),
    )
)]


pub async fn create_media_library(
    State(AppState { media_library_service, .. }): State<AppState>,
    axum::Json(req): axum::Json<CreateMediaLibraryRequest>,
) -> ApiResult<impl IntoResponse> {

    // 验证输入
    if req.title.is_empty() {
        return Err(AppError::Biz("Title is required".to_string()));
    }

    // 调用媒体库服务进行创建（异步扫描版本）
    let media_library = media_library_service.create_async(req)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let media_library_info = MediaLibraryInfo::from(media_library);

    let response = ApiResponse::ok(
        Some("Create media library successful (scanning in background)"),
        Some(media_library_info),
        None,
        None,
    );

    Ok((StatusCode::CREATED, axum::Json(response)))
}
// endregion
// region: 查询所有媒体库
#[utoipa::path(
    get,
    path = "/api/media_libraries",
    tag = "media_library",
    responses(
        (status = 200, description = "Query all media libraries successfully", body = ApiResponse<Vec<MediaLibraryInfo>>),
    )
)]
pub async fn query_all_media_libraries(
    State(AppState { media_library_service, .. }): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    // 调用媒体库服务查询所有媒体库
    let media_libraries = media_library_service.query_all_media_libraries()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to query media libraries: {}", e)))?;

    let media_library_infos: Vec<MediaLibraryInfo> = media_libraries
        .into_iter()
        .map(MediaLibraryInfo::from)
        .collect();

    let response = ApiResponse::ok(
        Some("Query media libraries successful"),
        Some(media_library_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion
// region: 根据媒体库 ID 查询所有漫画
#[utoipa::path(
    get,
    path = "/api/media_libraries/{mediaLibraryId}/manga",
    tag = "media_library",
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<Vec<MangaInfo>>),
    )
)]
pub async fn get_manga_by_media_library(
    State(AppState { manga_service, .. }): State<AppState>,
    Path(media_library_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let mangas = manga_service.find_by_media_library_id(media_library_id).await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let manga_infos: Vec<MangaInfo> = mangas
        .into_iter()
        .map(MangaInfo::from)
        .collect();

    let response = ApiResponse::ok(
        Some("Get manga list successful"),
        Some(manga_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 删除媒体库
#[utoipa::path(
    delete,
    path = "/api/media_libraries/{id}",
    tag = "media_library",
    responses(
        (status = 200, description = "Delete media library successful"),
        (status = 404, description = "Media library not found"),
    )
)]
pub async fn delete_media_library(
    State(AppState { media_library_service, .. }): State<AppState>,
    Path(id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    // 删除媒体库（包括级联删除关联的游戏和漫画）
    media_library_service.delete(id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let response = ApiResponse::ok(
        Some("Delete media library successful"),
        Some(()),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 获取扫描任务状态
#[utoipa::path(
    get,
    path = "/api/media_libraries/{id}/scan-status",
    tag = "media_library",
    responses(
        (status = 200, description = "Get scan task status successfully", body = ApiResponse<ScanTaskInfo>),
        (status = 404, description = "Scan task not found"),
    )
)]
pub async fn get_scan_status(
    State(AppState { media_library_service, .. }): State<AppState>,
    Path(id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let task_id = id.to_string();

    let task = media_library_service.get_scan_task(&task_id)
        .await
        .ok_or_else(|| AppError::Biz("Scan task not found".to_string()))?;

    let task_info = ScanTaskInfo::from(task);

    // 调试日志：查看任务信息
    tracing::debug!("📊 Scan task info: total_files={}, processed_files={}, status={:?}",
        task_info.total_files, task_info.processed_files, task_info.status);

    let response = ApiResponse::ok(
        Some("Get scan task status successful"),
        Some(task_info),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 取消扫描任务
#[utoipa::path(
    post,
    path = "/api/media_libraries/{id}/scan-cancel",
    tag = "media_library",
    responses(
        (status = 200, description = "Cancel scan task successfully"),
        (status = 404, description = "Scan task not found"),
    )
)]
pub async fn cancel_scan_task(
    State(AppState { media_library_service, .. }): State<AppState>,
    Path(id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let task_id = id.to_string();

    media_library_service.cancel_scan_task(&task_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let response = ApiResponse::ok(
        Some("Cancel scan task successful"),
        Some(()),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

/// 媒体库路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/local", routing::post(create_media_library))
        .route("/webdav", routing::post(create_media_library)) // WebDAV 使用相同的处理函数
        .route("/", routing::get(query_all_media_libraries))
        .route("/{media_library_id}/manga", routing::get(get_manga_by_media_library))
        .route("/{id}", routing::delete(delete_media_library))
        .route("/{id}/scan-status", routing::get(get_scan_status))
        .route("/{id}/scan-cancel", routing::post(cancel_scan_task))
}

