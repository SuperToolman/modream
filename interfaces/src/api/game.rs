use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{GameInfo, PagedResponse, PaginationQuery};
use axum::Router;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// region: 扫描游戏请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct ScanGamesRequest {
    /// 要扫描的路径
    pub path: String,
    /// 游戏数据库提供者列表（如 "IGDB,DLSITE,STEAMDB"）
    pub providers: String,
    /// 所属媒体库 ID
    pub media_library_id: i32,
}

/// 启动游戏请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct LaunchGameRequest {
    /// 启动路径（可选，如果不提供则使用默认启动路径）
    pub start_path: Option<String>,
}

/// 更新默认启动路径请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateDefaultStartPathRequest {
    /// 默认启动路径
    pub start_path_default: String,
}
// endregion

// region: 根据 ID 查询游戏
#[utoipa::path(
    get,
    path = "/api/games/{game_id}",  // 改为和路由一致的参数名
    tag = "game",
    params(
        ("game_id" = i32, Path, description = "游戏ID")  // 添加参数定义
    ),
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<GameInfo>),
        (status = 404, description = "游戏不存在"),
    )
)]
pub async fn get_game(
    State(AppState { game_service, .. }): State<AppState>,
    Path(game_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let game = game_service
        .find_by_id(game_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::NotFound)?;

    let game_info = GameInfo::from(game);

    let response = ApiResponse::ok(Some("Get game successful"), Some(game_info), None, None);

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 分页查询全部游戏
#[utoipa::path(
    get,
    path = "/api/games",
    tag = "game",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 10", example = 10),
    ),
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<PagedResponse<GameInfo>>),
    )
)]
pub async fn get_games_paged(
    State(AppState { game_service, .. }): State<AppState>,
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
    let total = game_service
        .count_all()
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 分页查询
    let games = game_service
        .find_paged(params.page_size, params.page_index)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .unwrap_or_default();

    // 转换为 DTO
    let game_infos: Vec<GameInfo> = games.into_iter().map(GameInfo::from).collect();

    // 构建分页响应
    let paged_response = PagedResponse::new(params.page_index, params.page_size, total, game_infos);

    let response = ApiResponse::ok(
        Some("Get games list successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 扫描游戏文件夹
/// 扫描游戏
#[utoipa::path(
    post,
    path = "/api/games/scan",
    tag = "game",
    request_body = ScanGamesRequest,
    responses(
        (status = 200, description = "扫描成功", body = ApiResponse<Vec<GameInfo>>),
        (status = 400, description = "参数错误"),
    )
)]

pub async fn scan_games(
    State(AppState { game_service, .. }): State<AppState>,
    axum::Json(req): axum::Json<ScanGamesRequest>,
) -> ApiResult<impl IntoResponse> {
    // 验证参数
    if req.path.is_empty() {
        return Err(AppError::Biz("path is required".to_string()));
    }

    if req.providers.is_empty() {
        return Err(AppError::Biz("providers is required".to_string()));
    }

    // 扫描并创建游戏
    let games = game_service
        .scan_and_create(&req.path, &req.providers, req.media_library_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 转换为 DTO
    let game_infos: Vec<GameInfo> = games.into_iter().map(GameInfo::from).collect();

    let response = ApiResponse::ok(
        Some(&format!("Successfully scanned {} games", game_infos.len())),
        Some(game_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 删除游戏
#[utoipa::path(
    delete,
    path = "/api/games/{game_id}",  // 改为一致的参数名
    tag = "game",
    params(
        ("game_id" = i32, Path, description = "游戏ID")  // 添加参数定义
    ),
    responses(
        (status = 200, description = "删除成功"),
        (status = 404, description = "游戏不存在"),
    )
)]
pub async fn delete_game(
    State(AppState { game_service, .. }): State<AppState>,
    Path(game_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    // 先检查游戏是否存在
    let _game = game_service
        .find_by_id(game_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::NotFound)?;

    // 删除游戏
    game_service
        .delete(game_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let response = ApiResponse::ok(Some("Delete game successful"), Some(()), None, None);

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 根据媒体库 ID 查询游戏
#[utoipa::path(
    get,
    path = "/api/media-libraries/{media_library_id}/games",  // 改为和路由一致的参数名
    tag = "game",
    params(
        ("media_library_id" = i32, Path, description = "媒体库ID")  // 添加参数定义
    ),
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<Vec<GameInfo>>),
    )
)]
pub async fn get_games_by_media_library(
    State(AppState { game_service, .. }): State<AppState>,
    Path(media_library_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let games = game_service
        .find_by_media_library_id(media_library_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    // 转换为 DTO
    let game_infos: Vec<GameInfo> = games.into_iter().map(GameInfo::from).collect();

    let response = ApiResponse::ok(
        Some("Get games by media library successful"),
        Some(game_infos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 启动游戏
/// 启动游戏
#[utoipa::path(
    post,
    path = "/api/games/{game_id}/launch",
    tag = "game",
    params(
        ("game_id" = i32, Path, description = "游戏ID")
    ),
    request_body = LaunchGameRequest,
    responses(
        (status = 200, description = "启动成功", body = ApiResponse<String>),
        (status = 404, description = "游戏不存在"),
    )
)]
pub async fn launch_game(
    State(AppState { game_service, .. }): State<AppState>,
    Path(game_id): Path<i32>,
    axum::Json(req): axum::Json<LaunchGameRequest>,
) -> ApiResult<impl IntoResponse> {
    // 查询游戏
    let mut game = game_service
        .find_by_id(game_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::NotFound)?;

    // 确定要启动的路径
    let start_path = if let Some(path) = req.start_path {
        // 如果提供了启动路径，检查是否需要更新默认启动路径
        if game.start_path_default.as_ref() != Some(&path) {
            game.set_default_start_path(Some(path.clone()));
            // 更新数据库
            game_service
                .update(game.clone())
                .await
                .map_err(|e| AppError::Biz(e.to_string()))?;
        }
        path
    } else {
        // 使用默认启动路径或第一个启动路径
        game.start_path_default
            .clone()
            .or_else(|| {
                game.get_start_paths()
                    .ok()
                    .and_then(|paths| paths.first().cloned())
            })
            .ok_or_else(|| AppError::Biz("没有可用的启动路径".to_string()))?
    };

    // 拼接完整路径
    let full_path = std::path::Path::new(&game.root_path).join(&start_path);
    let full_path_str = full_path
        .to_str()
        .ok_or_else(|| AppError::Biz("无效的路径".to_string()))?;

    // 在服务器端启动游戏
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(&["/C", "start", "", full_path_str])
            .spawn()
            .map_err(|e| AppError::Biz(format!("启动游戏失败: {}", e)))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(full_path_str)
            .spawn()
            .map_err(|e| AppError::Biz(format!("启动游戏失败: {}", e)))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(full_path_str)
            .spawn()
            .map_err(|e| AppError::Biz(format!("启动游戏失败: {}", e)))?;
    }

    tracing::info!("Game launched: {}", full_path_str);

    let response = ApiResponse::ok(
        Some("Launch game successful"),
        Some(full_path_str.to_string()),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 更新默认启动路径
/// 更新默认启动路径
#[utoipa::path(
    put,
    path = "/api/games/{game_id}/default-start-path",
    tag = "game",
    params(
        ("game_id" = i32, Path, description = "游戏ID")
    ),
    request_body = UpdateDefaultStartPathRequest,
    responses(
        (status = 200, description = "更新成功", body = ApiResponse<GameInfo>),
        (status = 404, description = "游戏不存在"),
    )
)]
pub async fn update_default_start_path(
    State(AppState { game_service, .. }): State<AppState>,
    Path(game_id): Path<i32>,
    axum::Json(req): axum::Json<UpdateDefaultStartPathRequest>,
) -> ApiResult<impl IntoResponse> {
    // 查询游戏
    let mut game = game_service
        .find_by_id(game_id)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?
        .ok_or_else(|| AppError::NotFound)?;

    // 更新默认启动路径
    game.set_default_start_path(Some(req.start_path_default));

    // 保存到数据库
    let updated_game = game_service
        .update(game)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let game_info = GameInfo::from(updated_game);

    let response = ApiResponse::ok(
        Some("Update default start path successful"),
        Some(game_info),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
// endregion

// region: 路由配置
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/games", routing::get(get_games_paged))
        .route("/games/{game_id}", routing::get(get_game))
        .route("/games/{game_id}", routing::delete(delete_game))
        .route("/games/{game_id}/launch", routing::post(launch_game))
        .route(
            "/games/{game_id}/default-start-path",
            routing::put(update_default_start_path),
        )
        .route(
            "/media-libraries/{media_library_id}/games",
            routing::get(get_games_by_media_library),
        )
        // 只有启用 gamebox feature 时才添加扫描路由
        .route("/games/scan", routing::post(scan_games))
}
// endregion
