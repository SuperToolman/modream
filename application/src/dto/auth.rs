use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 登录请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct LoginRequest {
    /// 用户邮箱
    #[schema(example = "user@example.com")]
    pub email: String,
    /// 密码
    #[schema(example = "password123")]
    pub password: String,
}

/// 登录响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct LoginResponse {
    /// 用户 ID
    #[schema(example = 1)]
    pub user_id: i32,
    /// 用户名
    #[schema(example = "张三")]
    pub name: Option<String>,
    /// 用户邮箱
    #[schema(example = "user@example.com")]
    pub email: Option<String>,
    /// JWT Token
    #[schema(example = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")]
    pub token: String,
    /// Token 过期时间（秒）
    #[schema(example = 86400)]
    pub expires_in: i64,
}

