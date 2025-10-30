//! `SeaORM` Entity for Game
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "Game")]
pub struct Model {
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    #[sea_orm(column_name = "CreateTime", column_type = "custom(\"DATETIME\")")]
    pub create_time: String,
    #[sea_orm(column_name = "UpdateTime", column_type = "custom(\"DATETIME\")")]
    pub update_time: String,
    #[sea_orm(column_name = "Title", column_type = "Text")]
    pub title: String,
    #[sea_orm(column_name = "SubTitle", column_type = "Text", nullable)]
    pub sub_title: Option<String>,
    #[sea_orm(column_name = "Covers", column_type = "Text", nullable)]
    pub covers: Option<String>,
    #[sea_orm(column_name = "Version", column_type = "Text", nullable)]
    pub version: Option<String>,
    #[sea_orm(column_name = "RootPath", column_type = "Text")]
    pub root_path: String,
    #[sea_orm(column_name = "StartPaths", column_type = "Text")]
    pub start_paths: String,
    #[sea_orm(column_name = "StartPathDefault", column_type = "Text", nullable)]
    pub start_path_default: Option<String>,
    #[sea_orm(column_name = "StartItemCount")]
    pub start_item_count: i32,
    #[sea_orm(column_name = "Description", column_type = "Text")]
    pub description: String,
    #[sea_orm(column_name = "ReleaseDate", column_type = "custom(\"DATETIME\")")]
    pub release_date: String,
    #[sea_orm(column_name = "Developer", column_type = "Text", nullable)]
    pub developer: Option<String>,
    #[sea_orm(column_name = "Publisher", column_type = "Text", nullable)]
    pub publisher: Option<String>,
    #[sea_orm(column_name = "Tabs", column_type = "Text", nullable)]
    pub tabs: Option<String>,
    #[sea_orm(column_name = "Platform", column_type = "Text", nullable)]
    pub platform: Option<String>,
    #[sea_orm(column_name = "ByteSize")]
    pub byte_size: i32,
    #[sea_orm(column_name = "MediaLibraryId")]
    pub media_library_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::media_library::Entity",
        from = "Column::MediaLibraryId",
        to = "super::media_library::Column::Id"
    )]
    MediaLibrary,
}

impl Related<super::media_library::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MediaLibrary.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

// ============================================================================
// 业务方法（充血模型）
// ============================================================================

impl Model {
    /// 创建新游戏（工厂方法）
    ///
    /// # 参数
    /// - `title`: 游戏标题
    /// - `root_path`: 游戏根目录
    /// - `start_paths`: 启动路径列表（JSON 数组字符串）
    /// - `release_date`: 发行日期
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `anyhow::Result<Self>` - 创建的游戏实体
    ///
    /// # 业务规则
    /// - 标题不能为空，长度不超过 200 个字符
    /// - 根目录路径不能为空
    /// - 启动路径必须是有效的 JSON 数组
    /// - 字节大小必须大于等于 0
    pub fn new(
        title: String,
        root_path: String,
        start_paths: String,
        release_date: String,
        media_library_id: i32,
    ) -> anyhow::Result<Self> {
        // 使用领域服务验证业务规则
        crate::service::GameDomainService::validate_title(&title)?;
        crate::service::GameDomainService::validate_root_path(&root_path)?;
        crate::service::GameDomainService::validate_start_paths(&start_paths)?;
        crate::service::GameDomainService::validate_release_date(&release_date)?;

        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(Self {
            id: 0, // 数据库会自动生成
            title,
            root_path,
            start_paths,
            release_date,
            media_library_id,
            create_time: now.clone(),
            update_time: now,
            sub_title: None,
            covers: None,
            version: None,
            start_path_default: None,
            start_item_count: 0,
            description: String::new(),
            developer: None,
            publisher: None,
            tabs: None,
            platform: None,
            byte_size: 0,
        })
    }

    /// 从 gamebox::GameInfo 创建游戏实体（工厂方法）
    ///
    /// # 参数
    /// - `game_info`: gamebox 库扫描返回的游戏信息
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `anyhow::Result<Self>` - 创建的游戏实体
    ///
    /// # 职责
    /// - ✅ 将 gamebox::GameInfo 转换为 domain::entity::game::Model
    /// - ✅ 应用业务规则验证
    /// - ✅ 处理类型转换（DateTime → String, PathBuf → String, u64 → i32）
    #[cfg(feature = "gamebox")]
    pub fn from_game_info(
        game_info: gamebox::models::game_info::GameInfo,
        media_library_id: i32,
    ) -> anyhow::Result<Self> {
        // 🔍 添加调试日志
        tracing::debug!("=== GameInfo from gamebox ===");
        tracing::debug!("Title: {}", game_info.title);
        tracing::debug!("SubTitle: '{}'", game_info.sub_title);
        tracing::debug!("Version: {:?}", game_info.version);
        tracing::debug!("Description: {:?}", game_info.description);
        tracing::debug!("Developer: {:?}", game_info.developer);
        tracing::debug!("Publisher: {:?}", game_info.publisher);
        tracing::debug!("Tabs: {:?}", game_info.tabs);
        tracing::debug!("Platform: {:?}", game_info.platform);
        tracing::debug!("CoverUrls: {:?} (count: {})", game_info.cover_urls, game_info.cover_urls.len());
        tracing::debug!("StartPath: {:?} (count: {})", game_info.start_path, game_info.start_path.len());
        tracing::debug!("StartPathDefault: '{}'", game_info.start_path_defualt);
        tracing::debug!("ByteSize: {}", game_info.byte_size);
        tracing::debug!("============================");

        // 转换 release_date (DateTime<Utc>) 为字符串
        let release_date = game_info.release_date.format("%Y-%m-%d %H:%M:%S").to_string();

        // 转换 dir_path (PathBuf) 为字符串
        let root_path = game_info.dir_path.to_string_lossy().to_string();

        // 转换 start_path (Vec<String>) 为 JSON 字符串
        let start_paths = serde_json::to_string(&game_info.start_path)?;

        // 转换 byte_size (u64) 为 i32
        let byte_size = game_info.byte_size.min(i32::MAX as u64) as i32;

        // 转换 covers (Vec<String>) 为 JSON 字符串
        let covers = if game_info.cover_urls.is_empty() {
            None
        } else {
            Some(serde_json::to_string(&game_info.cover_urls)?)
        };

        // 提取 sub_title（如果为空则设置为 None）
        let sub_title = if game_info.sub_title.is_empty() {
            None
        } else {
            Some(game_info.sub_title)
        };

        // 提取 start_path_default
        let start_path_default = if game_info.start_path_defualt.is_empty() {
            None
        } else {
            Some(game_info.start_path_defualt)
        };

        // 计算 start_item_count
        let start_item_count = game_info.start_path.len() as i32;

        // 使用领域服务验证业务规则
        crate::service::GameDomainService::validate_title(&game_info.title)?;
        crate::service::GameDomainService::validate_root_path(&root_path)?;
        crate::service::GameDomainService::validate_start_paths(&start_paths)?;
        crate::service::GameDomainService::validate_release_date(&release_date)?;
        crate::service::GameDomainService::validate_byte_size(byte_size)?;

        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(Self {
            id: 0, // 数据库会自动生成
            title: game_info.title,
            root_path,
            start_paths,
            release_date,
            media_library_id,
            create_time: now.clone(),
            update_time: now,
            sub_title,
            covers,
            version: game_info.version,
            start_path_default,
            start_item_count,
            description: game_info.description.unwrap_or_default(),
            developer: game_info.developer,
            publisher: game_info.publisher,
            tabs: game_info.tabs,
            platform: game_info.platform,
            byte_size,
        })
    }

    /// 更新标题
    ///
    /// # 参数
    /// - `new_title`: 新标题
    ///
    /// # 业务规则
    /// - 标题不能为空，长度不超过 200 个字符
    pub fn update_title(&mut self, new_title: String) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_title(&new_title)?;
        self.title = new_title;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 设置子标题
    pub fn set_sub_title(&mut self, sub_title: Option<String>) {
        self.sub_title = sub_title;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 设置封面列表
    ///
    /// # 参数
    /// - `covers`: 封面 URL 列表（JSON 数组字符串）
    ///
    /// # 业务规则
    /// - 必须是有效的 JSON 数组格式
    pub fn set_covers(&mut self, covers: String) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_json_array(&covers)?;
        self.covers = Some(covers);
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 设置版本
    pub fn set_version(&mut self, version: Option<String>) {
        self.version = version;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 更新启动路径列表
    ///
    /// # 参数
    /// - `start_paths`: 启动路径列表（JSON 数组字符串）
    ///
    /// # 业务规则
    /// - 必须是有效的 JSON 数组格式
    pub fn update_start_paths(&mut self, start_paths: String) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_start_paths(&start_paths)?;
        self.start_paths = start_paths;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 设置默认启动路径
    pub fn set_default_start_path(&mut self, path: Option<String>) {
        self.start_path_default = path;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 更新启动项数量
    ///
    /// # 业务规则
    /// - 数量必须大于等于 0
    pub fn update_start_item_count(&mut self, count: i32) -> anyhow::Result<()> {
        if count < 0 {
            return Err(anyhow::anyhow!("启动项数量不能为负数"));
        }
        self.start_item_count = count;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 更新描述
    pub fn update_description(&mut self, description: String) {
        self.description = description;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 更新发行日期
    ///
    /// # 业务规则
    /// - 必须是有效的日期格式
    pub fn update_release_date(&mut self, release_date: String) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_release_date(&release_date)?;
        self.release_date = release_date;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 设置开发商
    pub fn set_developer(&mut self, developer: Option<String>) {
        self.developer = developer;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 设置发行商
    pub fn set_publisher(&mut self, publisher: Option<String>) {
        self.publisher = publisher;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 设置标签
    ///
    /// # 参数
    /// - `tabs`: 标签列表（JSON 数组字符串）
    ///
    /// # 业务规则
    /// - 必须是有效的 JSON 数组格式
    pub fn set_tabs(&mut self, tabs: String) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_json_array(&tabs)?;
        self.tabs = Some(tabs);
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 设置平台
    pub fn set_platform(&mut self, platform: Option<String>) {
        self.platform = platform;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 更新字节大小
    ///
    /// # 业务规则
    /// - 字节大小必须大于等于 0
    pub fn update_byte_size(&mut self, byte_size: i32) -> anyhow::Result<()> {
        crate::service::GameDomainService::validate_byte_size(byte_size)?;
        self.byte_size = byte_size;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 获取封面列表
    ///
    /// # 返回
    /// - `anyhow::Result<Vec<String>>` - 封面 URL 列表
    pub fn get_covers(&self) -> anyhow::Result<Vec<String>> {
        match &self.covers {
            Some(covers_json) => crate::service::GameDomainService::parse_json_array(covers_json),
            None => Ok(Vec::new()),
        }
    }

    /// 获取启动路径列表
    ///
    /// # 返回
    /// - `anyhow::Result<Vec<String>>` - 启动路径列表
    pub fn get_start_paths(&self) -> anyhow::Result<Vec<String>> {
        crate::service::GameDomainService::parse_json_array(&self.start_paths)
    }

    /// 获取标签列表
    ///
    /// # 返回
    /// - `anyhow::Result<Vec<String>>` - 标签列表
    pub fn get_tabs(&self) -> anyhow::Result<Vec<String>> {
        match &self.tabs {
            Some(tabs_json) => crate::service::GameDomainService::parse_json_array(tabs_json),
            None => Ok(Vec::new()),
        }
    }

    /// 判断是否有封面
    pub fn has_covers(&self) -> bool {
        self.covers.is_some()
    }

    /// 判断是否有默认启动路径
    pub fn has_default_start_path(&self) -> bool {
        self.start_path_default.is_some()
    }

    /// 获取格式化的文件大小
    pub fn get_formatted_size(&self) -> String {
        crate::service::GameDomainService::format_byte_size(self.byte_size)
    }
}

