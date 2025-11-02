use crate::dto::{LoginRequest, LoginResponse};
use infrastructure::jwt::JwtService;
use infrastructure::password::PasswordService;
use std::sync::Arc;

use crate::user_service::UserService;

/// 认证服务
pub struct AuthService {
    user_service: Arc<UserService>,
}

impl AuthService {
    /// 创建新的认证服务实例
    pub fn new(user_service: Arc<UserService>) -> Self {
        Self { user_service }
    }

    /// 用户登录
    pub async fn login(
        &self,
        req: LoginRequest,
    ) -> anyhow::Result<LoginResponse> {
        // 根据邮箱查询用户
        let user = self.user_service.find_by_email(&req.email)
            .await?
            .ok_or_else(|| anyhow::anyhow!("User not found"))?;

        // 验证密码
        let stored_password = user
            .password
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("User password not set"))?;

        let is_valid = PasswordService::verify_password(&req.password, stored_password)?;
        if !is_valid {
            return Err(anyhow::anyhow!("Invalid password"));
        }

        // 生成 JWT Token
        let (token, expires_in) = JwtService::generate_token(user.id, user.e_mail.clone())?;

        Ok(LoginResponse {
            user_id: user.id,
            name: user.name,
            email: user.e_mail,
            token,
            expires_in,
        })
    }

    /// 验证 Token 并获取用户 ID
    pub fn verify_and_get_user_id(token: &str) -> anyhow::Result<i32> {
        let claims = JwtService::verify_token(token)?;
        let user_id = claims
            .sub
            .parse::<i32>()
            .map_err(|_| anyhow::anyhow!("Invalid user id in token"))?;
        Ok(user_id)
    }
}

