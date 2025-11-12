use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{
    GameboxConfigResponse, UpdateGameboxConfigRequest,
    ServerConfigResponse, UpdateServerConfigRequest,
    DatabaseConfigResponse, UpdateDatabaseConfigRequest,
};
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
#[utoipa::path(
    put,
    path = "/api/config/gamebox",
    tag = "config",
    request_body = UpdateGameboxConfigRequest,
    responses(
        (status = 200, description = "成功修改配置文件（需要重启服务）", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "修改配置文件失败"),
    )
)]
pub async fn update_gamebox_config(
    State(_state): State<AppState>,
    axum::Json(req): axum::Json<UpdateGameboxConfigRequest>,
) -> ApiResult<impl IntoResponse> {
    // 读取当前配置文件
    let config_path = "application.yaml";
    let config_content = tokio::fs::read_to_string(config_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to read config file: {}", e)))?;

    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&config_content)
        .map_err(|e| AppError::Biz(format!("Failed to parse YAML: {}", e)))?;

    // 更新 gamebox 配置
    if let Some(gamebox) = yaml_value.get_mut("gamebox") {
        // 更新 IGDB 配置
        if let Some(igdb_req) = req.igdb {
            if let Some(igdb) = gamebox.get_mut("igdb") {
                if let Some(client_id) = igdb_req.client_id {
                    igdb["client_id"] = serde_yaml::Value::String(client_id);
                }
                if let Some(client_secret) = igdb_req.client_secret {
                    igdb["client_secret"] = serde_yaml::Value::String(client_secret);
                }
                if let Some(enabled) = igdb_req.enabled {
                    igdb["enabled"] = serde_yaml::Value::Bool(enabled);
                }
            }
        }

        // 更新 DLSite 配置
        if let Some(dlsite_req) = req.dlsite {
            if let Some(dlsite) = gamebox.get_mut("dlsite") {
                if let Some(enabled) = dlsite_req.enabled {
                    dlsite["enabled"] = serde_yaml::Value::Bool(enabled);
                }
            }
        }

        // 更新 SteamDB 配置
        if let Some(steamdb_req) = req.steamdb {
            if let Some(steamdb) = gamebox.get_mut("steamdb") {
                if let Some(enabled) = steamdb_req.enabled {
                    steamdb["enabled"] = serde_yaml::Value::Bool(enabled);
                }
            }
        }
    }

    // 写入配置文件
    let yaml_content = serde_yaml::to_string(&yaml_value)
        .map_err(|e| AppError::Biz(format!("Failed to serialize YAML: {}", e)))?;

    tokio::fs::write(config_path, yaml_content)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to write config file: {}", e)))?;

    tracing::info!("✅ Gamebox configuration updated successfully");

    let response = ApiResponse::ok(
        Some("配置文件已更新，请重启服务使配置生效"),
        Some(serde_json::json!({
            "message": "Gamebox 配置已成功写入 application.yaml，请重启服务使配置生效。",
            "restart_required": true
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

/// 获取 Server 配置
#[utoipa::path(
    get,
    path = "/api/config/server",
    tag = "config",
    responses(
        (status = 200, description = "成功获取 Server 配置", body = ApiResponse<ServerConfigResponse>),
        (status = 500, description = "获取配置失败"),
    )
)]
pub async fn get_server_config(
    State(_state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    let config = shared::config::get();
    let server_config = config.server();

    let response_dto = ServerConfigResponse::from(server_config);

    let response = ApiResponse::ok(
        Some("Get server config successful"),
        Some(response_dto),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 更新 Server 配置
#[utoipa::path(
    put,
    path = "/api/config/server",
    tag = "config",
    request_body = UpdateServerConfigRequest,
    responses(
        (status = 200, description = "成功修改配置文件（需要重启服务）", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "修改配置文件失败"),
    )
)]
pub async fn update_server_config(
    State(_state): State<AppState>,
    axum::Json(req): axum::Json<UpdateServerConfigRequest>,
) -> ApiResult<impl IntoResponse> {
    // 读取当前配置文件
    let config_path = "application.yaml";
    let config_content = tokio::fs::read_to_string(config_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to read config file: {}", e)))?;

    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&config_content)
        .map_err(|e| AppError::Biz(format!("Failed to parse YAML: {}", e)))?;

    // 更新 server 配置
    if let Some(server) = yaml_value.get_mut("server") {
        if let Some(port) = req.port {
            server["port"] = serde_yaml::Value::Number(port.into());
        }
        if let Some(api_url) = req.api_url {
            server["api_url"] = serde_yaml::Value::String(api_url);
        }
        if let Some(mode) = req.mode {
            server["mode"] = serde_yaml::Value::String(mode);
        }
        if let Some(auto_start_api) = req.auto_start_api {
            server["auto_start_api"] = serde_yaml::Value::Bool(auto_start_api);
        }
    }

    // 写入配置文件
    let yaml_content = serde_yaml::to_string(&yaml_value)
        .map_err(|e| AppError::Biz(format!("Failed to serialize YAML: {}", e)))?;

    tokio::fs::write(config_path, yaml_content)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to write config file: {}", e)))?;

    tracing::info!("✅ Server configuration updated successfully");

    let response = ApiResponse::ok(
        Some("配置文件已更新，请重启服务使配置生效"),
        Some(serde_json::json!({
            "message": "Server 配置已成功写入 application.yaml，请重启服务使配置生效。",
            "restart_required": true
        })),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取 Database 配置
#[utoipa::path(
    get,
    path = "/api/config/database",
    tag = "config",
    responses(
        (status = 200, description = "成功获取 Database 配置", body = ApiResponse<DatabaseConfigResponse>),
        (status = 500, description = "获取配置失败"),
    )
)]
pub async fn get_database_config(
    State(_state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    let config = shared::config::get();
    let database_config = config.database();

    let response_dto = DatabaseConfigResponse::from(database_config);

    let response = ApiResponse::ok(
        Some("Get database config successful"),
        Some(response_dto),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 更新 Database 配置
#[utoipa::path(
    put,
    path = "/api/config/database",
    tag = "config",
    request_body = UpdateDatabaseConfigRequest,
    responses(
        (status = 200, description = "成功修改配置文件（需要重启服务）", body = ApiResponse<serde_json::Value>),
        (status = 500, description = "修改配置文件失败"),
    )
)]
pub async fn update_database_config(
    State(_state): State<AppState>,
    axum::Json(req): axum::Json<UpdateDatabaseConfigRequest>,
) -> ApiResult<impl IntoResponse> {
    // 读取当前配置文件
    let config_path = "application.yaml";
    let config_content = tokio::fs::read_to_string(config_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to read config file: {}", e)))?;

    let mut yaml_value: serde_yaml::Value = serde_yaml::from_str(&config_content)
        .map_err(|e| AppError::Biz(format!("Failed to parse YAML: {}", e)))?;

    // 更新 database 配置
    if let Some(database) = yaml_value.get_mut("database") {
        if let Some(host) = req.host {
            database["host"] = serde_yaml::Value::String(host);
        }
        if let Some(port) = req.port {
            database["port"] = serde_yaml::Value::Number(port.into());
        }
        if let Some(user) = req.user {
            database["user"] = serde_yaml::Value::String(user);
        }
        if let Some(password) = req.password {
            database["password"] = serde_yaml::Value::String(password);
        }
        if let Some(db) = req.database {
            database["database"] = serde_yaml::Value::String(db);
        }
        if let Some(schema) = req.schema {
            database["schema"] = serde_yaml::Value::String(schema);
        }
        if let Some(sqlite_url) = req.sqlite_database_url {
            database["sqlite_database_url"] = serde_yaml::Value::String(sqlite_url);
        }
    }

    // 写入配置文件
    let yaml_content = serde_yaml::to_string(&yaml_value)
        .map_err(|e| AppError::Biz(format!("Failed to serialize YAML: {}", e)))?;

    tokio::fs::write(config_path, yaml_content)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to write config file: {}", e)))?;

    tracing::info!("✅ Database configuration updated successfully");

    let response = ApiResponse::ok(
        Some("配置文件已更新，请重启服务使配置生效"),
        Some(serde_json::json!({
            "message": "Database 配置已成功写入 application.yaml，请重启服务使配置生效。",
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
        .route("/server", routing::get(get_server_config))
        .route("/server", routing::put(update_server_config))
        .route("/database", routing::get(get_database_config))
        .route("/database", routing::put(update_database_config))
        .route("/gamebox", routing::get(get_gamebox_config))
        .route("/gamebox", routing::put(update_gamebox_config))
}

