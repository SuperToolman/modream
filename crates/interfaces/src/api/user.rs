use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Router, routing};
use domain::entity::user::Model as UserModel;

pub fn create_router() -> Router<AppState> {
    Router::new().route("/", routing::get(query_all_users))
}

/// 查询所有用户
///
/// 获取系统中所有用户的信息列表
#[utoipa::path(
    get,
    path = "/api/users",
    tag = "user",
    responses(
        (status = 200, description = "查询成功", body = ApiResponse<Vec<UserModel>>),
        (status = 500, description = "查询失败"),
    )
)]
pub async fn query_all_users(
    State(AppState { user_service, .. }): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    // 调用 UserService 查询所有用户
    let users = user_service.query_all_users()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to query users: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Query successful"),
        Some(users),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
