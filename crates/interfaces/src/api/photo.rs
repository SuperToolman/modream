use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{PhotoInfo, PhotoDetailInfo, PhotoAlbumInfo, PagedResponse, PaginationQuery};
use axum::body::Body;
use axum::extract::{Path, Query, State};
use axum::http::{header, Response, StatusCode};
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;
use tokio_util::io::ReaderStream;

// region: 照片查询接口

/// 获取单个照片详情
///
/// 根据照片 ID 获取照片的详细信息（包含 EXIF）
#[utoipa::path(
    get,
    path = "/api/photos/{photo_id}",
    tag = "photo",
    params(
        ("photo_id" = i32, Path, description = "照片 ID")
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PhotoDetailInfo>),
        (status = 404, description = "照片不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photo(
    State(state): State<AppState>,
    Path(photo_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let photo_detail = state
        .photo_service
        .get_detail_by_id(photo_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get photo: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get photo successful"),
        Some(photo_detail),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取照片分页列表
///
/// 支持分页查询所有照片
#[utoipa::path(
    get,
    path = "/api/photos",
    tag = "photo",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 20", example = 20),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<PhotoInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photos_paged(
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

    // 分页查询
    let (photos, total) = state
        .photo_service
        .get_paged(params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get photos: {}", e)))?;

    // 构建分页响应
    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, photos);

    let response = ApiResponse::ok(
        Some("Get photos successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 根据媒体库 ID 获取照片列表
///
/// 获取指定媒体库下的所有照片
#[utoipa::path(
    get,
    path = "/api/media-libraries/{media_library_id}/photos",
    tag = "photo",
    params(
        ("media_library_id" = i32, Path, description = "媒体库 ID"),
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 20", example = 20),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<PhotoInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photos_by_media_library(
    State(state): State<AppState>,
    Path(media_library_id): Path<i32>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    // 验证参数
    if params.page_index <= 0 || params.page_size <= 0 {
        return Err(AppError::Biz(
            "page_index and page_size must be greater than 0".to_string(),
        ));
    }

    let (photos, total) = state
        .photo_service
        .get_by_media_library_id_paged(media_library_id, params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get photos: {}", e)))?;

    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, photos);

    let response = ApiResponse::ok(
        Some("Get photos by media library successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取收藏的照片列表
///
/// 分页查询所有收藏的照片
#[utoipa::path(
    get,
    path = "/api/photos/favorites",
    tag = "photo",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 20", example = 20),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<PhotoInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_favorites_paged(
    State(state): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    let (photos, total) = state
        .photo_service
        .get_favorites_paged(params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get favorite photos: {}", e)))?;

    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, photos);

    let response = ApiResponse::ok(
        Some("Get favorite photos successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 根据标签查询照片
///
/// 查询包含指定标签的照片
#[utoipa::path(
    get,
    path = "/api/photos/tag/{tag}",
    tag = "photo",
    params(
        ("tag" = String, Path, description = "标签名称"),
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 20", example = 20),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<Vec<PhotoInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photos_by_tag(
    State(state): State<AppState>,
    Path(tag): Path<String>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    let photos = state
        .photo_service
        .get_by_tag(&tag, params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get photos by tag: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get photos by tag successful"),
        Some(photos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 切换照片收藏状态
///
/// 如果照片已收藏则取消收藏，否则添加收藏
#[utoipa::path(
    put,
    path = "/api/photos/{photo_id}/favorite",
    tag = "photo",
    params(
        ("photo_id" = i32, Path, description = "照片 ID")
    ),
    responses(
        (status = 200, description = "操作成功", body = ApiResponse<PhotoInfo>),
        (status = 404, description = "照片不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn toggle_favorite(
    State(state): State<AppState>,
    Path(photo_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let photo = state
        .photo_service
        .toggle_favorite(photo_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to toggle favorite: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Toggle favorite successful"),
        Some(photo),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 删除照片
///
/// 根据照片 ID 删除照片（软删除）
#[utoipa::path(
    delete,
    path = "/api/photos/{photo_id}",
    tag = "photo",
    params(
        ("photo_id" = i32, Path, description = "照片 ID")
    ),
    responses(
        (status = 200, description = "删除成功"),
        (status = 404, description = "照片不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn delete_photo(
    State(state): State<AppState>,
    Path(photo_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    state
        .photo_service
        .delete(photo_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to delete photo: {}", e)))?;

    let response: ApiResponse<()> = ApiResponse::ok(
        Some("Delete photo successful"),
        None,
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}




/// 获取照片图片流
///
/// 支持流式传输照片图片
#[utoipa::path(
    get,
    path = "/api/photos/{photo_id}/image",
    tag = "photo",
    params(
        ("photo_id" = i32, Path, description = "照片 ID")
    ),
    responses(
        (status = 200, description = "返回照片图片"),
        (status = 404, description = "照片不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photo_image(
    State(state): State<AppState>,
    Path(photo_id): Path<i32>,
) -> Result<Response<Body>, AppError> {
    // 获取照片文件路径
    let photo_path = state
        .photo_service
        .get_photo_path(photo_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 获取文件元数据
    let metadata = tokio::fs::metadata(&photo_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get file metadata: {}", e)))?;

    let file_size = metadata.len();

    // 获取文件扩展名用于确定 MIME 类型
    let extension = std::path::Path::new(&photo_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    // 确定 MIME 类型
    let mime_type = get_image_mime_type(extension);

    // 打开文件
    let file = tokio::fs::File::open(&photo_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open photo: {}", e)))?;

    // 创建流式读取器
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    // 构建响应
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type)
        .header(header::CONTENT_LENGTH, file_size.to_string())
        .header(
            header::CACHE_CONTROL,
            "public, max-age=31536000", // 1年缓存（照片不会改变）
        )
        .body(body)
        .unwrap())
}

/// 获取照片缩略图流
///
/// 支持流式传输照片缩略图
#[utoipa::path(
    get,
    path = "/api/photos/{photo_id}/thumbnail",
    tag = "photo",
    params(
        ("photo_id" = i32, Path, description = "照片 ID")
    ),
    responses(
        (status = 200, description = "返回缩略图"),
        (status = 404, description = "缩略图不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photo_thumbnail(
    State(state): State<AppState>,
    Path(photo_id): Path<i32>,
) -> Result<Response<Body>, AppError> {
    // 获取缩略图路径
    let thumbnail_path = state
        .photo_service
        .get_thumbnail_path(photo_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::Biz("Thumbnail not found".to_string()))?;

    // 获取文件元数据
    let metadata = tokio::fs::metadata(&thumbnail_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get file metadata: {}", e)))?;

    let file_size = metadata.len();

    // 获取文件扩展名用于确定 MIME 类型
    let extension = std::path::Path::new(&thumbnail_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    // 确定 MIME 类型
    let mime_type = get_image_mime_type(extension);

    // 打开文件
    let file = tokio::fs::File::open(&thumbnail_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open thumbnail: {}", e)))?;

    // 创建流式读取器
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    // 构建响应
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type)
        .header(header::CONTENT_LENGTH, file_size.to_string())
        .header(
            header::CACHE_CONTROL,
            "public, max-age=31536000", // 1年缓存
        )
        .body(body)
        .unwrap())
}

// endregion

// region: 相册管理接口

/// 获取所有相册
///
/// 查询所有相册列表
#[utoipa::path(
    get,
    path = "/api/albums",
    tag = "photo",
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<Vec<PhotoAlbumInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_all_albums(
    State(state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    let albums = state
        .photo_service
        .get_all_albums()
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get albums: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get albums successful"),
        Some(albums),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}


/// 获取单个相册详情
///
/// 根据相册 ID 获取相册详细信息
#[utoipa::path(
    get,
    path = "/api/albums/{album_id}",
    tag = "photo",
    params(
        ("album_id" = i32, Path, description = "相册 ID")
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PhotoAlbumInfo>),
        (status = 404, description = "相册不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_album(
    State(state): State<AppState>,
    Path(album_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let album = state
        .photo_service
        .get_album_by_id(album_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get album: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get album successful"),
        Some(album),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取相册中的照片
///
/// 分页查询指定相册中的所有照片
#[utoipa::path(
    get,
    path = "/api/albums/{album_id}/photos",
    tag = "photo",
    params(
        ("album_id" = i32, Path, description = "相册 ID"),
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 20", example = 20),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<PhotoInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_photos_by_album(
    State(state): State<AppState>,
    Path(album_id): Path<i32>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    let (photos, total) = state
        .photo_service
        .get_photos_by_album_id(album_id, params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get photos by album: {}", e)))?;

    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, photos);

    let response = ApiResponse::ok(
        Some("Get photos by album successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

// endregion

// region: 辅助函数

/// 根据文件扩展名获取图片 MIME 类型
fn get_image_mime_type(extension: &str) -> &'static str {
    match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "bmp" => "image/bmp",
        "webp" => "image/webp",
        "tiff" | "tif" => "image/tiff",
        "heic" => "image/heic",
        "heif" => "image/heif",
        _ => "application/octet-stream",
    }
}

// endregion

// region: 路由配置

/// 照片路由
pub fn routes() -> Router<AppState> {
    Router::new()
        // 照片管理
        .route("/photos", routing::get(get_photos_paged))
        .route("/photos/favorites", routing::get(get_favorites_paged))
        .route("/photos/tag/{tag}", routing::get(get_photos_by_tag))
        .route("/photos/{photo_id}", routing::get(get_photo))
        .route("/photos/{photo_id}", routing::delete(delete_photo))
        .route("/photos/{photo_id}/favorite", routing::put(toggle_favorite))
        .route("/photos/{photo_id}/image", routing::get(get_photo_image))
        .route("/photos/{photo_id}/thumbnail", routing::get(get_photo_thumbnail))
        // 媒体库照片
        .route(
            "/media-libraries/{media_library_id}/photos",
            routing::get(get_photos_by_media_library),
        )
        // 相册管理
        .route("/albums", routing::get(get_all_albums))
        .route("/albums/{album_id}", routing::get(get_album))
        .route("/albums/{album_id}/photos", routing::get(get_photos_by_album))
}

// endregion
