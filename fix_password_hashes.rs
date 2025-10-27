// 这是一个独立的脚本，用于修复数据库中的密码哈希
// 使用方法：
// 1. 将此文件放在项目根目录
// 2. 运行: cargo run --bin fix_password_hashes

use bcrypt::{hash, DEFAULT_COST};
use sea_orm::{Database, EntityTrait, ColumnTrait, QueryFilter, ActiveModelTrait, Set};
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 连接数据库
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://data/my_app.db".to_string());
    
    let db = Database::connect(&database_url).await?;
    
    println!("连接到数据库: {}", database_url);
    
    // 获取所有用户
    let users = domain::entity::user::Entity::find()
        .all(&db)
        .await?;
    
    println!("找到 {} 个用户", users.len());
    
    for user in users {
        if let Some(password) = &user.password {
            // 检查密码是否已经是 bcrypt 哈希（bcrypt 哈希以 $2 开头）
            if !password.starts_with("$2") {
                println!("正在修复用户 {} ({}): {}", user.id, user.e_mail.as_ref().unwrap_or(&"unknown".to_string()), password);
                
                // 对密码进行哈希处理
                let hashed = hash(password, DEFAULT_COST)?;
                
                // 更新用户
                let mut active_model = user.into();
                active_model.password = Set(Some(hashed.clone()));
                active_model.update(&db).await?;
                
                println!("✅ 用户 {} 密码已更新", user.id);
            } else {
                println!("⏭️  用户 {} 密码已是哈希格式，跳过", user.id);
            }
        }
    }
    
    println!("✅ 所有用户密码已修复！");
    Ok(())
}

