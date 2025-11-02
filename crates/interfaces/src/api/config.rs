use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{GameboxConfigResponse, UpdateGameboxConfigRequest};
use axum::Router;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;

/// 获取 Gamebox 配置
#[utoipa::path(
    get,
    path = "/api/config/gamebox",
    tag = "config",
    responses(
        (status = 200, description = "成功获取 Gamebox 配置", body = ApiResponse<GameboxConfigResponse>),
        (status = 500, description = "获取配置失败"),
    )
)]
pub async fn get_gamebox_config(
    State(_state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    // 从全局配置中读取
    let config = shared::config::get();
    let gamebox_config = config.gamebox();
    
    let response_dto = GameboxConfigResponse::from(gamebox_config);
    
    let response = ApiResponse::ok(
        Some("Get gamebox config successful"),
        Some(response_dto),
        None,
        None,
    );
    
    Ok((StatusCode::OK, axum::Json(response)))
}

/// 更新 Gamebox 配置
///
/// 注意：此 API 只更新运行时配置，不会持久化到 application.yaml
/// 需要手动编辑 application.yaml 文件来永久保存配置
#[utoipa::path(
    put,
    path = "/api/config/gamebox",
    tag = "config",
    request_body = UpdateGameboxConfigRequest,
    responses(
        (status = 200, description = "返回配置更新提示", body = ApiResponse<serde_json::Value>),
    )
)]
pub async fn update_gamebox_config(
    State(_state): State<AppState>,
    axum::Json(_req): axum::Json<UpdateGameboxConfigRequest>,
) -> ApiResult<impl IntoResponse> {
    // 由于配置是通过 LazyLock 静态加载的，无法在运行时修改
    // 这里返回一个提示信息，告诉用户需要手动编辑配置文件
    
    let response = ApiResponse::ok(
        Some("配置更新需要手动编辑 application.yaml 文件并重启服务"),
        Some(serde_json::json!({
            "message": "请编辑项目根目录下的 application.yaml 文件，在 gamebox.igdb 部分配置 client_id、client_secret 和 enabled 字段，然后重启服务使配置生效。"
        })),
        None,
        None,
    );
    
    Ok((StatusCode::OK, axum::Json(response)))
}

/// 读取完整的 application.yaml 配置
#[utoipa::path(
    get,
    path = "/api/config",
    tag = "config",
    responses(
        (status = 200, description = "成功读取配置文件", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "读取配置文件失败"),
    )
)]
pub async fn get_config(
    State(_state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    // 读取 application.yaml 文件
    let config_path = "application.yaml";
    let config_content = tokio::fs::read_to_string(config_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to read config file: {}", e)))?;

    // 解析 YAML 为 JSON
    let yaml_value: serde_yaml::Value = serde_yaml::from_str(&config_content)
        .map_err(|e| AppError::Biz(format!("Failed to parse YAML: {}", e)))?;

    let json_value: serde_json::Value = serde_json::to_value(&yaml_value)
        .map_err(|e| AppError::Biz(format!("Failed to convert to JSON: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get config successful"),
        Some(json_value),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 修改 application.yaml 配置
#[utoipa::path(
    put,
    path = "/api/config",
    tag = "config",
    request_body = serde_json::Value,
    responses(
        (status = 200, description = "成功修改配置文件（需要重启服务）", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "修改配置文件失败"),
    )
)]
pub async fn update_config(
    State(_state): State<AppState>,
    axum::Json(new_config): axum::Json<serde_json::Value>,
) -> ApiResult<impl IntoResponse> {
    // 将 JSON 转换为 YAML
    let yaml_value: serde_yaml::Value = serde_json::from_value(new_config.clone())
        .map_err(|e| AppError::Biz(format!("Failed to convert JSON to YAML: {}", e)))?;

    let yaml_content = serde_yaml::to_string(&yaml_value)
        .map_err(|e| AppError::Biz(format!("Failed to serialize YAML: {}", e)))?;

    // 写入 application.yaml 文件
    let config_path = "application.yaml";
    tokio::fs::write(config_path, yaml_content)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to write config file: {}", e)))?;

    tracing::info!("✅ Configuration file updated successfully");

    let response = ApiResponse::ok(
        Some("配置文件已更新，请重启服务使配置生效"),
        Some(serde_json::json!({
            "message": "配置文件已成功写入 application.yaml，请重启服务使配置生效。",
            "restart_required": true
        })),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 配置路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", routing::get(get_config))
        .route("/", routing::put(update_config))
        .route("/gamebox", routing::get(get_gamebox_config))
        .route("/gamebox", routing::put(update_gamebox_config))
}

