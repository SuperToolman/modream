use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::user_service::UserService;
use application::dto::{LoginRequest, LoginResponse, RegisterRequest, UserInfo};
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;

pub fn create_router() -> Router<AppState> {
    Router::new()
        .route("/login", routing::post(login))
        .route("/register", routing::post(register))
}

/// 用户登录
///
/// 使用邮箱和密码进行登录，成功后返回 JWT Token
#[utoipa::path(
    post,
    path = "/api/auth/login",
    tag = "auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "登录成功", body = ApiResponse<LoginResponse>),
        (status = 500, description = "登录失败"),
    )
)]
pub async fn login(
    State(AppState { auth_service, .. }): State<AppState>,
    axum::Json(req): axum::Json<LoginRequest>,
) -> ApiResult<impl IntoResponse> {
    // 验证输入
    if req.email.is_empty() || req.password.is_empty() {
        return Err(AppError::Biz("Email and password are required".to_string()));
    }

    // 调用认证服务进行登录
    let login_response = auth_service.login(req)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let response = ApiResponse::<LoginResponse>::ok(
        Some("Login successful"),
        Some(login_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 用户注册
///
/// 使用用户名、邮箱和密码进行注册
#[utoipa::path(
    post,
    path = "/api/auth/register",
    tag = "auth",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "注册成功", body = ApiResponse<UserInfo>),
        (status = 500, description = "注册失败"),
    )
)]
pub async fn register(
    State(AppState { user_service, .. }): State<AppState>,
    axum::Json(req): axum::Json<RegisterRequest>,
) -> ApiResult<impl IntoResponse> {
    // 验证输入
    if req.name.is_empty() || req.email.is_empty() || req.password.is_empty() {
        return Err(AppError::Biz(
            "Name, email and password are required".to_string(),
        ));
    }

    // 调用用户服务进行注册
    let user = user_service.register(req)
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let user_info = UserService::to_user_info(user);

    let response = ApiResponse::ok(
        Some("Register successful"),
        Some(user_info),
        None,
        None,
    );

    Ok((StatusCode::CREATED, axum::Json(response)))
}

