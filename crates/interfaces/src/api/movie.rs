use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{MovieInfo, PagedResponse, PaginationQuery};
use axum::body::Body;
use axum::extract::{Path, Query, State};
use axum::http::{header, HeaderMap, Response, StatusCode};
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;
use tokio_util::io::ReaderStream;

// region: 电影查询接口

/// 获取单个电影详情
///
/// 根据电影 ID 获取电影的详细信息
#[utoipa::path(
    get,
    path = "/api/movies/{movie_id}",
    tag = "movie",
    params(
        ("movie_id" = i32, Path, description = "电影 ID")
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<MovieInfo>),
        (status = 404, description = "电影不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_movie(
    State(state): State<AppState>,
    Path(movie_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let movie = state
        .movie_service
        .get_by_id(movie_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get movie: {}", e)))?;

    let movie_info: MovieInfo = movie.into();

    let response = ApiResponse::ok(
        Some("Get movie successful"),
        Some(movie_info),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取电影分页列表
///
/// 支持分页查询所有电影
#[utoipa::path(
    get,
    path = "/api/movies",
    tag = "movie",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 10", example = 10),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<MovieInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_movies_paged(
    State(state): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    // 验证参数
    if params.page_index <= 0 || params.page_size <= 0 {
        return Err(AppError::Biz(
            "page_index and page_size must be greater than 0".to_string(),
        ));
    }

    if params.page_size > 100 {
        return Err(AppError::Biz(
            "page_size must be less than or equal to 100".to_string(),
        ));
    }

    // 获取总数
    let total = state
        .movie_service
        .count_all()
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 分页查询
    let (movies, _) = state
        .movie_service
        .get_paged(params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get movies: {}", e)))?;

    // 转换为 DTO
    let movie_infos: Vec<MovieInfo> = movies.into_iter().map(|m| m.into()).collect();

    // 构建分页响应
    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, movie_infos);

    let response = ApiResponse::ok(
        Some("Get movies successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 根据媒体库 ID 获取电影列表
///
/// 获取指定媒体库下的所有电影
#[utoipa::path(
    get,
    path = "/api/media-libraries/{media_library_id}/movies",
    tag = "movie",
    params(
        ("media_library_id" = i32, Path, description = "媒体库 ID")
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<Vec<MovieInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_movies_by_media_library(
    State(state): State<AppState>,
    Path(media_library_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let movies = state
        .movie_service
        .get_by_media_library_id(media_library_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get movies: {}", e)))?;

    let movie_infos: Vec<MovieInfo> = movies.into_iter().map(|m| m.into()).collect();

    let response = ApiResponse::ok(
        Some("Get movies by media library successful"),
        Some(movie_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 删除电影
///
/// 根据电影 ID 删除电影
#[utoipa::path(
    delete,
    path = "/api/movies/{movie_id}",
    tag = "movie",
    params(
        ("movie_id" = i32, Path, description = "电影 ID")
    ),
    responses(
        (status = 200, description = "删除成功"),
        (status = 404, description = "电影不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn delete_movie(
    State(state): State<AppState>,
    Path(movie_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    state
        .movie_service
        .delete(movie_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to delete movie: {}", e)))?;

    let response: ApiResponse<()> = ApiResponse::ok(
        Some("Delete movie successful"),
        None,
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取电影视频流
///
/// 支持流式传输和 Range 请求（断点续传）
#[utoipa::path(
    get,
    path = "/api/movies/{movie_id}/video",
    tag = "movie",
    params(
        ("movie_id" = i32, Path, description = "电影 ID")
    ),
    responses(
        (status = 200, description = "返回完整视频"),
        (status = 206, description = "返回部分视频内容（Range 请求）"),
        (status = 404, description = "电影不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_movie_video(
    State(state): State<AppState>,
    Path(movie_id): Path<i32>,
    headers: HeaderMap,
) -> Result<Response<Body>, AppError> {
    // 获取视频文件路径
    let video_path = state
        .movie_service
        .get_movie_video_path(movie_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 获取文件元数据
    let metadata = tokio::fs::metadata(&video_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get file metadata: {}", e)))?;

    let file_size = metadata.len();

    // 获取文件扩展名用于确定 MIME 类型
    let extension = std::path::Path::new(&video_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("mp4");

    // 确定 MIME 类型
    let mime_type = get_video_mime_type(extension);

    // 解析 Range 请求头
    let range_header = headers.get(header::RANGE);

    if let Some(range_value) = range_header {
        // 处理 Range 请求
        if let Ok(range_str) = range_value.to_str() {
            if let Some(range) = parse_range_header(range_str, file_size) {
                return serve_video_range(&video_path, range, file_size, &mime_type).await;
            }
        }
    }

    // 没有 Range 请求，返回完整文件（流式传输）
    let file = tokio::fs::File::open(&video_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open video: {}", e)))?;

    // 创建流式读取器
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    // 构建响应
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type)
        .header(header::CONTENT_LENGTH, file_size.to_string())
        .header(header::ACCEPT_RANGES, "bytes")
        .header(
            header::CACHE_CONTROL,
            "public, max-age=2592000", // 30天缓存
        )
        .body(body)
        .unwrap())
}

// endregion

// region: 辅助函数

/// 根据文件扩展名获取视频 MIME 类型
fn get_video_mime_type(extension: &str) -> &'static str {
    match extension.to_lowercase().as_str() {
        "mp4" => "video/mp4",
        "mkv" => "video/x-matroska",
        "webm" => "video/webm",
        "avi" => "video/x-msvideo",
        "mov" => "video/quicktime",
        "wmv" => "video/x-ms-wmv",
        "flv" => "video/x-flv",
        "m4v" => "video/x-m4v",
        "3gp" => "video/3gpp",
        "ts" => "video/mp2t",
        _ => "application/octet-stream",
    }
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

    let start_str = parts[0];
    let end_str = parts[1];

    // 解析起始位置和结束位置
    let (start, end) = if start_str.is_empty() {
        // 格式：bytes=-1024（最后 1024 字节）
        let suffix_length: u64 = end_str.parse().ok()?;
        let start = file_size.saturating_sub(suffix_length);
        (start, file_size - 1)
    } else if end_str.is_empty() {
        // 格式：bytes=1024-（从 1024 到文件末尾）
        let start: u64 = start_str.parse().ok()?;
        (start, file_size - 1)
    } else {
        // 格式：bytes=0-1023
        let start: u64 = start_str.parse().ok()?;
        let end: u64 = end_str.parse().ok()?;
        (start, end)
    };

    // 验证范围
    if start >= file_size || end >= file_size || start > end {
        return None;
    }

    Some((start, end))
}

/// 提供部分视频内容（Range 响应）
///
/// 性能优化：
/// - 对于小范围请求（< 1MB），直接读入内存
/// - 对于大范围请求（>= 1MB），使用流式传输
async fn serve_video_range(
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
            "public, max-age=2592000", // 30天缓存
        )
        .body(body)
        .unwrap())
}

// endregion

// region: 路由配置

/// 电影路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/movies", routing::get(get_movies_paged))
        .route("/movies/{movie_id}", routing::get(get_movie))
        .route("/movies/{movie_id}", routing::delete(delete_movie))
        .route("/movies/{movie_id}/video", routing::get(get_movie_video))
        .route(
            "/media-libraries/{media_library_id}/movies",
            routing::get(get_movies_by_media_library),
        )
}

// endregion

