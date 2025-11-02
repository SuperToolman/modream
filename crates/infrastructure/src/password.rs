use bcrypt::{hash, verify, DEFAULT_COST};

/// 密码服务
pub struct PasswordService;

impl PasswordService {
    /// 对密码进行哈希处理
    pub fn hash_password(password: &str) -> anyhow::Result<String> {
        hash(password, DEFAULT_COST)
            .map_err(|e| anyhow::anyhow!("Failed to hash password: {}", e))
    }

    /// 验证密码是否正确
    pub fn verify_password(password: &str, hash: &str) -> anyhow::Result<bool> {
        verify(password, hash)
            .map_err(|e| anyhow::anyhow!("Failed to verify password: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify() {
        let password = "test_password_123";
        let hashed = PasswordService::hash_password(password).unwrap();
        
        // 验证正确的密码
        let is_valid = PasswordService::verify_password(password, &hashed).unwrap();
        assert!(is_valid);
        
        // 验证错误的密码
        let is_invalid = PasswordService::verify_password("wrong_password", &hashed).unwrap();
        assert!(!is_invalid);
    }
}

