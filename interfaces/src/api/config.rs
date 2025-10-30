use crate::app::AppState;
use crate::error::ApiResult;
use crate::response::ApiResponse;
use application::dto::{GameboxConfigResponse, UpdateGameboxConfigRequest};
use axum::Router;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;

/// 获取 Gamebox 配置
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

/// 配置路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/gamebox", routing::get(get_gamebox_config))
        .route("/gamebox", routing::put(update_gamebox_config))
}

