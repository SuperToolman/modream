use crate::dto::{RegisterRequest, UserInfo};
use domain::repository::UserRepository;
use infrastructure::password::PasswordService;
use std::sync::Arc;

/// 用户服务
pub struct UserService {
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    /// 创建新的用户服务实例
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }

    /// 根据邮箱查询用户
    pub async fn find_by_email(
        &self,
        email: &str,
    ) -> anyhow::Result<Option<domain::entity::user::Model>> {
        self.repo.find_by_email(email).await
    }

    /// 根据用户名查询用户
    pub async fn find_by_name(
        &self,
        name: &str,
    ) -> anyhow::Result<Option<domain::entity::user::Model>> {
        self.repo.find_by_name(name).await
    }

    /// 根据 ID 查询用户
    pub async fn find_by_id(
        &self,
        id: i32,
    ) -> anyhow::Result<Option<domain::entity::user::Model>> {
        self.repo.find_by_id(id).await
    }

    /// 注册新用户
    pub async fn register(
        &self,
        req: RegisterRequest,
    ) -> anyhow::Result<domain::entity::user::Model> {
        // 验证密码一致性
        if req.password != req.password_confirm {
            return Err(anyhow::anyhow!("Passwords do not match"));
        }

        // 检查邮箱是否已存在
        if self.find_by_email(&req.email).await?.is_some() {
            return Err(anyhow::anyhow!("Email already exists"));
        }

        // 检查用户名是否已存在
        if self.find_by_name(&req.name).await?.is_some() {
            return Err(anyhow::anyhow!("Username already exists"));
        }

        // 对密码进行哈希处理
        let hashed_password = PasswordService::hash_password(&req.password)?;

        // 创建新用户
        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let user_model = domain::entity::user::Model {
            id: 0, // 数据库会自动生成
            name: Some(req.name),
            e_mail: Some(req.email),
            password: Some(hashed_password),
            create_time: now.clone(),
            update_time: now,
            phone: None,
            coin: 0,
            level: 0,
            now_exp: 0,
            next_exp: 0,
            birthday: None,
            sign: None,
            sex: None,
            is_have_avatar: false,
        };

        let user = self.repo.create(user_model).await?;
        Ok(user)
    }

    /// 查询所有用户
    pub async fn query_all_users(&self) -> anyhow::Result<Vec<domain::entity::user::Model>> {
        self.repo.find_all().await
    }

    /// 将用户模型转换为 UserInfo DTO
    pub fn to_user_info(user: domain::entity::user::Model) -> UserInfo {
        UserInfo {
            id: user.id,
            name: user.name,
            email: user.e_mail,
            phone: user.phone,
            level: user.level,
            coin: user.coin,
        }
    }
}

