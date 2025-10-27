use domain::value_object::JwtClaims;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use std::sync::LazyLock;

// JWT 密钥（在生产环境中应该从环境变量读取）
const JWT_SECRET: &str = "your-secret-key-change-in-production-environment";
const JWT_EXPIRES_IN: i64 = 24 * 60 * 60; // 24 小时

static ENCODING_KEY: LazyLock<EncodingKey> =
    LazyLock::new(|| EncodingKey::from_secret(JWT_SECRET.as_ref()));

static DECODING_KEY: LazyLock<DecodingKey> =
    LazyLock::new(|| DecodingKey::from_secret(JWT_SECRET.as_ref()));

/// JWT 服务
pub struct JwtService;

impl JwtService {
    /// 生成 JWT Token
    pub fn generate_token(user_id: i32, email: Option<String>) -> anyhow::Result<(String, i64)> {
        let claims = JwtClaims::new(user_id, email, JWT_EXPIRES_IN);
        let token = encode(&Header::default(), &claims, &ENCODING_KEY)
            .map_err(|e| anyhow::anyhow!("Failed to generate token: {}", e))?;
        Ok((token, JWT_EXPIRES_IN))
    }

    /// 验证并解析 JWT Token
    pub fn verify_token(token: &str) -> anyhow::Result<JwtClaims> {
        let data = decode::<JwtClaims>(token, &DECODING_KEY, &Validation::default())
            .map_err(|e| anyhow::anyhow!("Failed to verify token: {}", e))?;
        Ok(data.claims)
    }

    /// 从 Authorization header 中提取 token
    pub fn extract_token_from_header(auth_header: &str) -> anyhow::Result<String> {
        let parts: Vec<&str> = auth_header.split_whitespace().collect();
        if parts.len() != 2 || parts[0] != "Bearer" {
            return Err(anyhow::anyhow!("Invalid authorization header format"));
        }
        Ok(parts[1].to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_verify_token() {
        let user_id = 123;
        let email = Some("test@example.com".to_string());
        
        let (token, expires_in) = JwtService::generate_token(user_id, email.clone()).unwrap();
        assert!(!token.is_empty());
        assert_eq!(expires_in, JWT_EXPIRES_IN);
        
        let claims = JwtService::verify_token(&token).unwrap();
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.email, email);
    }

    #[test]
    fn test_extract_token_from_header() {
        let token = "test_token_123";
        let header = format!("Bearer {}", token);
        
        let extracted = JwtService::extract_token_from_header(&header).unwrap();
        assert_eq!(extracted, token);
    }

    #[test]
    fn test_invalid_token() {
        let result = JwtService::verify_token("invalid_token");
        assert!(result.is_err());
    }
}

