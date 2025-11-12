use anyhow::Context; // 错误处理工具库，提供上下文错误处理
use config::{Config, FileFormat}; // 配置管理库，支持多种配置源和格式
use serde::Deserialize; // 反序列化trait，用于从配置源解析数据
use std::sync::LazyLock;

pub use server::{ServerConfig, ServerMode}; // 导出服务器配置结构体和启动模式枚举
pub use database::DatabaseConfig;
pub use gamebox::GameboxConfig;
pub use movie::MovieConfig;
// 导出数据库配置机构提


// 延迟初始化静态变量，线程安全的懒加载
mod database;
pub mod server;
pub mod gamebox;
pub mod movie;
// 服务器配置模块，包含ServerConfig定义

static CONFIG: LazyLock<AppConfig> =
    LazyLock::new(|| AppConfig::load().expect("Failed to initialize config")); // 全局静态配置，使用懒加载初始化，首次访问时执行加载

// 应用配置结构体，包含所有子配置模块
#[derive(Debug, Deserialize)] // 自动实现Debug和反序列化
pub struct AppConfig {
    server: ServerConfig,
    database: DatabaseConfig,
    #[serde(default)]
    gamebox: GameboxConfig,
    #[serde(default)]
    movie: MovieConfig,
}

impl AppConfig {
    pub fn load() -> anyhow::Result<Self> {
        // 构建配置加载器，支持多种配置源
        Config::builder()
            // 添加YAML配置文件源，优先级较高
            .add_source(
                config::File::with_name("application") // 查找application.yml或application.yaml
                    .format(FileFormat::Yaml) // 指定YAML格式
                    .required(true), // 配置文件必须存在，否则报错
            )
            // 添加环境变量配置源，优先级较低（可被文件配置覆盖）
            .add_source(
                config::Environment::with_prefix("APP") // 环境变量前缀为APP_
                    .try_parsing(true) // 尝试解析环境变量值为合适的数据类型
                    .separator("_") // 嵌套字段分隔符，如APP_SERVER_PORT
                    .list_separator(","), // 数组值分隔符，如APP_SERVERS=1,2,3
            )
            .build() // 构建配置实例，合并所有配置源
            .with_context(|| anyhow::anyhow!("Failed to load application config"))? // 加载失败时添加错误上下文
            .try_deserialize() // 反序列化为AppConfig结构体
            .with_context(|| anyhow::anyhow!("Failed to deserialize config")) // 反序列化失败时添加错误上下文
    }

    // 直接返回引用，方便使用
    pub fn server(&self) -> &ServerConfig {
        &self.server
    }
    pub fn database(&self) -> &DatabaseConfig {
        &self.database
    }
    pub fn gamebox(&self) -> &GameboxConfig {
        &self.gamebox
    }
    pub fn movie(&self) -> &MovieConfig {
        &self.movie
    }
}

// 获取全局配置的引用，线程安全且高效
pub fn get() -> &'static AppConfig {
    &CONFIG // 返回静态配置的不可变引用
}