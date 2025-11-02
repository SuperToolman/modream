use async_trait::async_trait;
use domain::entity::user::{ActiveModel, Column, Entity as User, Model as UserModel};
use domain::repository::UserRepository;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
};

/// 用户仓储实现
pub struct UserRepositoryImpl {
    db: DatabaseConnection,
}

impl UserRepositoryImpl {
    /// 创建新的用户仓储实例
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl UserRepository for UserRepositoryImpl {
    /// 根据邮箱查询用户
    async fn find_by_email(&self, email: &str) -> anyhow::Result<Option<UserModel>> {
        let user = User::find()
            .filter(Column::EMail.eq(email))
            .one(&self.db)
            .await?;
        Ok(user)
    }

    /// 根据用户名查询用户
    async fn find_by_name(&self, name: &str) -> anyhow::Result<Option<UserModel>> {
        let user = User::find()
            .filter(Column::Name.eq(name))
            .one(&self.db)
            .await?;
        Ok(user)
    }

    /// 根据 ID 查询用户
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<UserModel>> {
        let user = User::find_by_id(id).one(&self.db).await?;
        Ok(user)
    }

    /// 查询所有用户
    async fn find_all(&self) -> anyhow::Result<Vec<UserModel>> {
        let users = User::find().all(&self.db).await?;
        Ok(users)
    }

    /// 创建新用户
    async fn create(&self, user: UserModel) -> anyhow::Result<UserModel> {
        let active_model = ActiveModel {
            id: Set(user.id),
            create_time: Set(user.create_time),
            update_time: Set(user.update_time),
            name: Set(user.name),
            e_mail: Set(user.e_mail),
            phone: Set(user.phone),
            password: Set(user.password),
            coin: Set(user.coin),
            level: Set(user.level),
            now_exp: Set(user.now_exp),
            next_exp: Set(user.next_exp),
            birthday: Set(user.birthday),
            sign: Set(user.sign),
            sex: Set(user.sex),
            is_have_avatar: Set(user.is_have_avatar),
        };

        let created_user = active_model.insert(&self.db).await?;
        Ok(created_user)
    }

    /// 更新用户
    async fn update(&self, user: UserModel) -> anyhow::Result<UserModel> {
        let active_model = ActiveModel {
            id: Set(user.id),
            create_time: Set(user.create_time),
            update_time: Set(user.update_time),
            name: Set(user.name),
            e_mail: Set(user.e_mail),
            phone: Set(user.phone),
            password: Set(user.password),
            coin: Set(user.coin),
            level: Set(user.level),
            now_exp: Set(user.now_exp),
            next_exp: Set(user.next_exp),
            birthday: Set(user.birthday),
            sign: Set(user.sign),
            sex: Set(user.sex),
            is_have_avatar: Set(user.is_have_avatar),
        };

        let updated_user = active_model.update(&self.db).await?;
        Ok(updated_user)
    }

    /// 删除用户
    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        User::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    /// 更新用户密码
    async fn update_password(&self, id: i32, hashed_password: String) -> anyhow::Result<()> {
        let user = User::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or_else(|| anyhow::anyhow!("User not found"))?;

        let mut active_model: ActiveModel = user.into();
        active_model.password = Set(Some(hashed_password));
        active_model.update(&self.db).await?;

        Ok(())
    }
}

