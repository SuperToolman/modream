use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 用户注册请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct RegisterRequest {
    /// 用户名
    #[schema(example = "张三")]
    pub name: String,
    /// 邮箱
    #[schema(example = "user@example.com")]
    pub email: String,
    /// 密码
    #[schema(example = "password123")]
    pub password: String,
    /// 确认密码
    #[schema(example = "password123")]
    pub password_confirm: String,
}

/// 用户信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UserInfo {
    /// 用户 ID
    #[schema(example = 1)]
    pub id: i32,
    /// 用户名
    #[schema(example = "张三")]
    pub name: Option<String>,
    /// 邮箱
    #[schema(example = "user@example.com")]
    pub email: Option<String>,
    /// 电话
    #[schema(example = "13800138000")]
    pub phone: Option<String>,
    /// 等级
    #[schema(example = 1)]
    pub level: i32,
    /// 金币
    #[schema(example = 0)]
    pub coin: i32,
}

