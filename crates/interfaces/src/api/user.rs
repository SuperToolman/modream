use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::FixPasswordsResponse;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Router, routing};
use domain::entity::user::Model as UserModel;

pub fn create_router() -> Router<AppState> {
    Router::new()
        .route("/", routing::get(query_all_users))
        .route("/fix-passwords", routing::post(fix_passwords))
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

/// 修复数据库中未哈希的密码
///
/// 此接口会：
/// 1. 查询所有用户
/// 2. 检查每个用户的密码是否已经是 bcrypt 哈希（以 $2 开头）
/// 3. 如果不是，则对密码进行哈希处理并更新
///
/// ⚠️ 注意：这是一个管理功能，建议添加适当的权限保护
#[utoipa::path(
    post,
    path = "/api/users/fix-passwords",
    tag = "user",
    responses(
        (status = 200, description = "密码修复成功", body = ApiResponse<FixPasswordsResponse>),
        (status = 500, description = "密码修复失败"),
    )
)]
pub async fn fix_passwords(
    State(AppState { user_service, .. }): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    // TODO: 添加管理员权限检查
    // 例如：检查请求头中的 JWT Token 是否属于管理员用户

    // 调用用户服务修复密码
    let fixed_count = user_service
        .fix_password_hashes()
        .await
        .map_err(|e| AppError::Biz(format!("Failed to fix passwords: {}", e)))?;

    // 获取总用户数
    let all_users = user_service
        .query_all_users()
        .await
        .map_err(|e| AppError::Biz(format!("Failed to query users: {}", e)))?;
    let total_count = all_users.len();

    let response_data = FixPasswordsResponse {
        fixed_count,
        total_count,
        message: format!("成功修复 {} 个用户的密码（共 {} 个用户）", fixed_count, total_count),
    };

    let response = ApiResponse::ok(
        Some("Password hashes fixed successfully"),
        Some(response_data),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}
