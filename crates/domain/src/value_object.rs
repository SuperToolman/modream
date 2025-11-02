/// 用户凭证值对象
#[derive(Debug, Clone)]
pub struct UserCredential {
    /// 邮箱或用户名
    pub identifier: String,
    /// 密码（明文）
    pub password: String,
}

impl UserCredential {
    pub fn new(identifier: String, password: String) -> Self {
        Self {
            identifier,
            password,
        }
    }
}

/// JWT 声明值对象
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct JwtClaims {
    /// 用户 ID
    pub sub: String,
    /// 发行时间
    pub iat: i64,
    /// 过期时间
    pub exp: i64,
    /// 用户邮箱
    pub email: Option<String>,
}

impl JwtClaims {
    pub fn new(user_id: i32, email: Option<String>, expires_in: i64) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            sub: user_id.to_string(),
            iat: now,
            exp: now + expires_in,
            email,
        }
    }
}

