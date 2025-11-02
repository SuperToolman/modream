use crate::entity::user::Model as UserModel;
use async_trait::async_trait;

/// 用户仓储接口
/// 定义所有用户数据访问操作的抽象接口
#[async_trait]
pub trait UserRepository: Send + Sync {
    /// 根据邮箱查询用户
    async fn find_by_email(&self, email: &str) -> anyhow::Result<Option<UserModel>>;

    /// 根据用户名查询用户
    async fn find_by_name(&self, name: &str) -> anyhow::Result<Option<UserModel>>;

    /// 根据 ID 查询用户
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<UserModel>>;

    /// 查询所有用户
    async fn find_all(&self) -> anyhow::Result<Vec<UserModel>>;

    /// 创建新用户
    async fn create(&self, user: UserModel) -> anyhow::Result<UserModel>;

    /// 更新用户
    async fn update(&self, user: UserModel) -> anyhow::Result<UserModel>;

    /// 删除用户
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 更新用户密码
    async fn update_password(&self, id: i32, hashed_password: String) -> anyhow::Result<()>;
}

