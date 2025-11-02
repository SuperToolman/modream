use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{MangaChapterInfo, OptimizedChapterImageListResponse, ThumbnailQuery};
use axum::Router;
use axum::body::Body;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, StatusCode, header, Response};
use axum::response::IntoResponse;
use axum::routing;
use tokio_util::io::ReaderStream;

// region: 获取漫画的所有章节
#[utoipa::path(
    get,
    path = "/api/manga_chapter/{mangaId}/chapters",
    tag = "manga_chapter",
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<Vec<MangaChapterInfo>>),
        (status = 404, description = "漫画不存在"),
    )
)]
pub async fn get_manga_chapters(
    State(AppState { manga_chapter_service, .. }): State<AppState>,
    Path(manga_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let chapters = manga_chapter_service
        .find_by_manga_id(manga_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let chapter_infos: Vec<MangaChapterInfo> = chapters
        .into_iter()
        .map(MangaChapterInfo::from)
        .collect();

    let response = ApiResponse::ok(
        Some("Get manga chapters successful"),
        Some(chapter_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 获取章节的所有图片列表（优化版本）
#[utoipa::path(
    get,
    path = "/api/manga_chapter/{mangaId}/{chapterId}/images",
    tag = "manga_chapter",
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<OptimizedChapterImageListResponse>),
        (status = 404, description = "章节不存在"),
    )
)]
pub async fn get_chapter_images(
    State(AppState { image_service, .. }): State<AppState>,
    Path((manga_id, chapter_id)): Path<(i32, i32)>,
) -> ApiResult<impl IntoResponse> {
    let images = image_service
        .get_chapter_images(chapter_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 从配置中获取 API 基础 URL
    let api_url = shared::config::get().server().api_url();

    // 优化：只返回图片数量和 URL 模板，而不是完整列表
    let optimized_response = OptimizedChapterImageListResponse {
        count: images.len() as i32,
        url_template: format!("{}/api/manga_chapter/{}/{}/images/{{index}}", api_url, manga_id, chapter_id),
    };

    let response = ApiResponse::ok(
        Some("Get chapter images successful"),
        Some(optimized_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 获取章节的第 N 张图片（流式传输，支持 HTTP Range）
#[utoipa::path(
    get,
    path = "/api/manga_chapter/{mangaId}/{chapterId}/images/{imageIndex}",
    tag = "manga_chapter",
    responses(
        (status = 200, description = "获取成功（完整内容）"),
        (status = 206, description = "获取成功（部分内容）"),
        (status = 404, description = "图片不存在"),
        (status = 416, description = "Range 不满足"),
    )
)]
pub async fn get_chapter_image(
    State(AppState { image_service, .. }): State<AppState>,
    Path((_manga_id, chapter_id, image_index)): Path<(i32, i32, i32)>,
    headers: HeaderMap,
) -> Result<Response<Body>, AppError> {
    // ✅ 获取图片路径
    let image_path = image_service
        .get_chapter_image_path(chapter_id, image_index)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // ✅ 获取文件元数据
    let metadata = tokio::fs::metadata(&image_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get file metadata: {}", e)))?;

    let file_size = metadata.len();

    // ✅ 获取文件扩展名用于确定 MIME 类型
    let extension = std::path::Path::new(&image_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    let mime_type = match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        _ => "application/octet-stream",
    };

    // ✅ 检查是否有 Range 请求头
    if let Some(range_header) = headers.get(header::RANGE) {
        return handle_range_request(&image_path, file_size, range_header, mime_type).await;
    }

    // ✅ 没有 Range 请求，返回完整文件
    let file = tokio::fs::File::open(&image_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open file: {}", e)))?;

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type)
        .header(header::CONTENT_LENGTH, file_size.to_string())
        .header(header::ACCEPT_RANGES, "bytes")
        .header(
            header::CACHE_CONTROL,
            shared::config::get()
                .server()
                .image()
                .cache()
                .image_cache_control(),
        )
        .body(body)
        .unwrap())
}
// endregion

// region: 获取章节漫画的封面缩略图

/// 获取章节漫画的封面缩略图
///
/// **注意：** 此接口总是返回第一章的第一张图片作为封面
/// 内部会自动查询第一章并获取其封面
///
/// 支持查询参数：
/// - `width`: 缩略图宽度（像素），默认 200
/// - `height`: 缩略图高度（像素），默认 300
/// - `quality`: 图片质量（0-100），默认 85
#[utoipa::path(
    get,
    path = "/api/manga_chapter/{mangaId}/cover",
    tag = "manga_chapter",
    params(
        ("width" = Option<u32>, Query, description = "缩略图宽度，默认 200"),
        ("height" = Option<u32>, Query, description = "缩略图高度，默认 300"),
        ("quality" = Option<u8>, Query, description = "图片质量 0-100，默认 85"),
    ),
    responses(
        (status = 200, description = "获取成功"),
        (status = 404, description = "封面不存在"),
    )
)]
pub async fn get_chapter_cover(
    State(AppState { image_service, .. }): State<AppState>,
    Path(manga_id): Path<i32>,
    Query(params): Query<ThumbnailQuery>,
) -> ApiResult<impl IntoResponse> {
    // ✅ 使用 get_manga_cover_thumbnail，它会自动处理章节漫画
    // 内部逻辑：检查 has_chapters 字段，如果为 true，自动获取第一章的封面
    let thumbnail_data = image_service
        .get_manga_cover_thumbnail(manga_id, params.width, params.height, params.quality)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // ✅ 缩略图总是 JPEG 格式
    let mime_type = "image/jpeg";

    // ✅ 构建响应头
    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        mime_type
            .parse()
            .unwrap_or_else(|_| "image/jpeg".parse().unwrap()),
    );
    headers.insert(
        header::CONTENT_LENGTH,
        thumbnail_data.len().to_string().parse().unwrap(),
    );
    headers.insert(
        header::CACHE_CONTROL,
        shared::config::get()
            .server()
            .image()
            .cache()
            .image_cache_control()
            .parse()
            .unwrap(),
    );

    Ok((StatusCode::OK, headers, thumbnail_data))
}
// endregion

/// 章节路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/{manga_id}/chapters", routing::get(get_manga_chapters))
        .route("/{manga_id}/cover", routing::get(get_chapter_cover))  // 获取第一章的封面
        .route(
            "/{manga_id}/{chapter_id}/images",
            routing::get(get_chapter_images),
        )
        .route(
            "/{manga_id}/{chapter_id}/images/{image_index}",
            routing::get(get_chapter_image),
        )
}

/// 处理 HTTP Range 请求（支持断点续传和部分内容请求）
async fn handle_range_request(
    image_path: &str,
    file_size: u64,
    range_header: &header::HeaderValue,
    mime_type: &str,
) -> Result<Response<Body>, AppError> {
    // 解析 Range 头（格式：bytes=start-end）
    let range_str = range_header
        .to_str()
        .map_err(|_| AppError::Biz("Invalid Range header".to_string()))?;

    if !range_str.starts_with("bytes=") {
        return Err(AppError::Biz("Invalid Range header format".to_string()));
    }

    let range_str = &range_str[6..]; // 去掉 "bytes=" 前缀
    let parts: Vec<&str> = range_str.split('-').collect();

    if parts.len() != 2 {
        return Err(AppError::Biz("Invalid Range header format".to_string()));
    }

    // 解析起始和结束位置
    let start: u64 = parts[0]
        .parse()
        .map_err(|_| AppError::Biz("Invalid Range start".to_string()))?;

    let end: u64 = if parts[1].is_empty() {
        file_size - 1
    } else {
        parts[1]
            .parse()
            .map_err(|_| AppError::Biz("Invalid Range end".to_string()))?
    };

    // 验证范围
    if start >= file_size || end >= file_size || start > end {
        return Err(AppError::Biz("Range not satisfiable".to_string()));
    }

    let content_length = end - start + 1;

    // 打开文件并跳转到起始位置
    use tokio::io::{AsyncReadExt, AsyncSeekExt};
    let mut file = tokio::fs::File::open(image_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open file: {}", e)))?;

    file.seek(std::io::SeekFrom::Start(start))
        .await
        .map_err(|e| AppError::Biz(format!("Failed to seek file: {}", e)))?;

    // 读取指定范围的数据
    let mut buffer = vec![0u8; content_length as usize];
    file.read_exact(&mut buffer)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to read file: {}", e)))?;

    let body = Body::from(buffer);

    // 构建响应
    Ok(Response::builder()
        .status(StatusCode::PARTIAL_CONTENT)
        .header(header::CONTENT_TYPE, mime_type)
        .header(header::CONTENT_LENGTH, content_length.to_string())
        .header(
            header::CONTENT_RANGE,
            format!("bytes {}-{}/{}", start, end, file_size),
        )
        .header(header::ACCEPT_RANGES, "bytes")
        .header(
            header::CACHE_CONTROL,
            shared::config::get()
                .server()
                .image()
                .cache()
                .image_cache_control(),
        )
        .body(body)
        .unwrap())
}

