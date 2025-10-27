use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use axum::Router;
use axum::body::Body;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, StatusCode, header, Response};
use axum::response::IntoResponse;
use axum::routing;
use serde::{Deserialize, Serialize};
use tokio_util::io::ReaderStream;

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ImageInfo {
    pub index: i32,
    pub path: String,
    /// 图片的 API URL，可以直接在前端使用
    pub url: String,
}

/// 优化的图片列表响应（减少数据传输）
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OptimizedImageListResponse {
    /// 图片总数
    pub count: i32,
    /// URL 模板，前端可以用 {index} 替换为实际索引
    /// 例如："/api/manga/12/images/{index}"
    pub url_template: String,
}

/// 缩略图查询参数
#[derive(Debug, Serialize, Deserialize)]
pub struct ThumbnailQuery {
    /// 缩略图宽度（像素），默认 200
    pub width: Option<u32>,
    /// 缩略图高度（像素），默认 300
    pub height: Option<u32>,
    /// 图片质量（0-100），默认 85
    pub quality: Option<u8>,
}

/// 获取漫画的所有图片列表（优化版本）
///
/// 返回图片总数和 URL 模板，而不是完整的图片列表
/// 这样可以大幅减少数据传输量（从几 KB 减少到几十字节）
#[utoipa::path(
    get,
    path = "/api/manga/{mangaId}/images",
    tag = "image",
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<OptimizedImageListResponse>),
        (status = 404, description = "漫画不存在"),
    )
)]
pub async fn get_manga_images(
    State(AppState { image_service, .. }): State<AppState>,
    Path(manga_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let images = image_service
        .get_manga_images(manga_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 从配置中获取 API 基础 URL
    let api_url = shared::config::get().server().api_url();

    // 优化：只返回图片数量和 URL 模板，而不是完整列表
    let optimized_response = OptimizedImageListResponse {
        count: images.len() as i32,
        url_template: format!("{}/api/manga/{}/images/{{index}}", api_url, manga_id),
    };

    let response = ApiResponse::ok(
        Some("Get manga images successful"),
        Some(optimized_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取漫画的第 N 张图片（流式传输，支持 HTTP Range）
///
/// 支持 HTTP Range 请求，允许：
/// - 断点续传
/// - 部分内容请求
/// - 视频播放器式的流式加载
#[utoipa::path(
    get,
    path = "/api/manga/{mangaId}/images/{imageIndex}",
    tag = "image",
    responses(
        (status = 200, description = "获取成功（完整内容）"),
        (status = 206, description = "获取成功（部分内容）"),
        (status = 404, description = "图片不存在"),
        (status = 416, description = "Range 不满足"),
    )
)]
pub async fn get_manga_image(
    State(AppState { image_service, .. }): State<AppState>,
    Path((manga_id, image_index)): Path<(i32, i32)>,
    headers: HeaderMap,
) -> Result<Response<Body>, AppError> {
    // ✅ 获取图片路径
    let image_path = image_service
        .get_manga_image_path(manga_id, image_index)
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

    // ✅ 从配置中获取 MIME 类型
    let mime_type = shared::config::get()
        .server()
        .image()
        .mime_types()
        .get_mime_type(extension);

    // ✅ 解析 Range 请求头
    let range_header = headers.get(header::RANGE);

    if let Some(range_value) = range_header {
        // 处理 Range 请求
        if let Ok(range_str) = range_value.to_str() {
            if let Some(range) = parse_range_header(range_str, file_size) {
                return serve_range(&image_path, range, file_size, &mime_type).await;
            }
        }
    }

    // ✅ 没有 Range 请求，返回完整文件（流式传输）
    let file = tokio::fs::File::open(&image_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open image: {}", e)))?;

    // ✅ 创建流式读取器
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    // ✅ 构建响应（优化：移除重复的 header 设置）
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

/// 获取漫画的封面缩略图
///
/// 支持查询参数：
/// - `width`: 缩略图宽度（像素），默认 200
/// - `height`: 缩略图高度（像素），默认 300
/// - `quality`: 图片质量（0-100），默认 85
#[utoipa::path(
    get,
    path = "/api/manga/{mangaId}/cover",
    tag = "image",
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
pub async fn get_manga_cover(
    State(AppState { image_service, .. }): State<AppState>,
    Path(manga_id): Path<i32>,
    Query(params): Query<ThumbnailQuery>,
) -> ApiResult<impl IntoResponse> {
    // ✅ 获取缩略图
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

    // ✅ 添加缓存控制响应头
    let cache_control = shared::config::get()
        .server()
        .image()
        .cache()
        .image_cache_control();
    headers.insert(
        header::CACHE_CONTROL,
        cache_control
            .parse()
            .unwrap_or_else(|_| "public, max-age=2592000".parse().unwrap()),
    );

    Ok((StatusCode::OK, headers, thumbnail_data))
}

/// 解析 Range 请求头
///
/// 支持格式：bytes=start-end
/// 例如：bytes=0-1023, bytes=1024-, bytes=-1024
fn parse_range_header(range_str: &str, file_size: u64) -> Option<(u64, u64)> {
    // 只支持 bytes 单位
    if !range_str.starts_with("bytes=") {
        return None;
    }

    let range_part = &range_str[6..]; // 去掉 "bytes="

    // 只处理第一个范围（不支持多范围请求）
    let first_range = range_part.split(',').next()?;

    let parts: Vec<&str> = first_range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].trim();
    let end = parts[1].trim();

    match (start.is_empty(), end.is_empty()) {
        (false, false) => {
            // bytes=start-end
            let start_pos = start.parse::<u64>().ok()?;
            let end_pos = end.parse::<u64>().ok()?;
            if start_pos <= end_pos && end_pos < file_size {
                Some((start_pos, end_pos))
            } else {
                None
            }
        }
        (false, true) => {
            // bytes=start-
            let start_pos = start.parse::<u64>().ok()?;
            if start_pos < file_size {
                Some((start_pos, file_size - 1))
            } else {
                None
            }
        }
        (true, false) => {
            // bytes=-end (最后 N 字节)
            let suffix_length = end.parse::<u64>().ok()?;
            if suffix_length > 0 && suffix_length <= file_size {
                Some((file_size - suffix_length, file_size - 1))
            } else {
                None
            }
        }
        (true, true) => None,
    }
}

/// 提供部分内容（Range 响应）
///
/// 性能优化：
/// - 对于小范围请求（< 1MB），直接读入内存
/// - 对于大范围请求（>= 1MB），使用流式传输
async fn serve_range(
    file_path: &str,
    range: (u64, u64),
    file_size: u64,
    mime_type: &str,
) -> Result<Response<Body>, AppError> {
    use tokio::io::{AsyncReadExt, AsyncSeekExt};

    let (start, end) = range;
    let content_length = end - start + 1;

    // 打开文件并定位到起始位置
    let mut file = tokio::fs::File::open(file_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open file: {}", e)))?;

    file.seek(std::io::SeekFrom::Start(start))
        .await
        .map_err(|e| AppError::Biz(format!("Failed to seek file: {}", e)))?;

    // 性能优化：根据请求大小选择不同的策略
    const BUFFER_THRESHOLD: u64 = 1024 * 1024; // 1MB

    let body = if content_length < BUFFER_THRESHOLD {
        // 小范围请求：直接读入内存（更快）
        let mut buffer = vec![0u8; content_length as usize];
        file.read_exact(&mut buffer)
            .await
            .map_err(|e| AppError::Biz(format!("Failed to read file: {}", e)))?;
        Body::from(buffer)
    } else {
        // 大范围请求：使用流式传输（节省内存）
        let limited_file = file.take(content_length);
        let stream = ReaderStream::new(limited_file);
        Body::from_stream(stream)
    };

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

/// 图片路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/{manga_id}/images", routing::get(get_manga_images))
        .route(
            "/{manga_id}/images/{image_index}",
            routing::get(get_manga_image),
        )
        .route("/{manga_id}/cover", routing::get(get_manga_cover))
}
