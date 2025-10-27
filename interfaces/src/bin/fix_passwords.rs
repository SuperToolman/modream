// 修复数据库中的密码哈希
// 运行: cargo run --bin fix_passwords

use bcrypt::{hash, DEFAULT_COST};
use sea_orm::{Database, EntityTrait, ActiveModelTrait, Set};
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 连接数据库
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://data/my_app.db".to_string());
    
    println!("🔧 开始修复密码哈希...");
    println!("📦 连接到数据库: {}", database_url);
    
    let db = Database::connect(&database_url).await?;
    
    // 获取所有用户
    let users = domain::entity::user::Entity::find()
        .all(&db)
        .await?;
    
    println!("👥 找到 {} 个用户\n", users.len());
    
    let mut fixed_count = 0;
    let mut skipped_count = 0;
    
    for user in users {
        if let Some(password) = &user.password {
            // 检查密码是否已经是 bcrypt 哈希（bcrypt 哈希以 $2 开头）
            if !password.starts_with("$2") {
                println!("🔄 正在修复用户 {} ({})", user.id, user.e_mail.as_ref().unwrap_or(&"unknown".to_string()));
                println!("   原密码: {}", password);
                
                // 对密码进行哈希处理
                let hashed = hash(password, DEFAULT_COST)?;
                println!("   新哈希: {}...", &hashed[0..20]);
                
                // 更新用户
                let mut active_model: domain::entity::user::ActiveModel = user.into();
                active_model.password = Set(Some(hashed));
                active_model.update(&db).await?;
                
                println!("   ✅ 已更新\n");
                fixed_count += 1;
            } else {
                println!("⏭️  用户 {} 密码已是哈希格式，跳过\n", user.id);
                skipped_count += 1;
            }
        }
    }
    
    println!("========================================");
    println!("✅ 修复完成！");
    println!("   修复数量: {}", fixed_count);
    println!("   跳过数量: {}", skipped_count);
    println!("========================================");
    
    Ok(())
}

