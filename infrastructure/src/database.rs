use sea_orm::{
    ConnectOptions, ConnectionTrait, Database, DatabaseConnection, DbBackend, Statement,
};
use std::cmp::max;
use std::time::Duration;

pub async fn init() -> anyhow::Result<DatabaseConnection> {
    let database_config = shared::config::get().database();
    let mut options = ConnectOptions::new(database_config.sqlite_database_url());

    let cpus = num_cpus::get() as u32;
    options
        .min_connections(max(cpus * 4, 10)) // 最小连接数：CPU核心数×4，至少10个连接
        .max_connections(max(cpus * 8, 20)) // 最大连接数：CPU核心数×8，至少20个连接
        .connect_timeout(Duration::from_secs(10)) // 连接超时时间：10秒
        .acquire_timeout(Duration::from_secs(30)) // 获取连接超时时间：30秒
        .idle_timeout(Duration::from_secs(300)) // 连接空闲超时时间：300秒（5分钟）
        .max_lifetime(Duration::from_secs(3600 * 24)) // 连接最大生命周期：24小时
        .sqlx_logging(false) // 禁用SQLx日志记录
        .set_schema_search_path(database_config.schema()); // 设置数据库模式搜索路径
    //     .sqlx_logging(true)  // 启用 SQL 日志（开发环境）
    //     .sqlx_logging_level(log::LevelFilter::Info)  // 日志级别
    //     .set_schema_search_path("public".into());  // 模式搜索路径

    // 创建数据库目录（如果不存在）
    // 修正：应该从数据库URL中提取路径来创建目录
    if let Some(path) = extract_db_path(database_config.sqlite_database_url()) {
        if let Some(parent) = std::path::Path::new(&path).parent() {
            std::fs::create_dir_all(parent)?;
        }
    }

    // 建立连接并返回
    let connection = Database::connect(options).await?;
    connection.ping().await?;
    tracing::info!("Database connected successfully.");
    log_database_version(&connection).await?;
    Ok(connection)
}

// 辅助函数：从SQLite URL提取文件路径
fn extract_db_path(url: &str) -> Option<String> {
    url.strip_prefix("sqlite://")
        .and_then(|s| s.split('?').next())
        .map(|s| s.to_string())
}

// 查询数据库版本
async fn log_database_version(db: &DatabaseConnection) -> anyhow::Result<()> {
    let version_result = db
        .query_one_raw(Statement::from_string(
            DbBackend::Sqlite,
            String::from("SELECT sqlite_version()"),
        ))
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to get database version."))?;

    tracing::info!(
        "SQLite version: {:?}",
        version_result.try_get_by_index::<String>(0)?
    );

    Ok(())
}
