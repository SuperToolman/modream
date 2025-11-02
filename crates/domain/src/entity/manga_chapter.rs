//! `SeaORM` Entity for MangaChapter
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "MangaChapter")]
pub struct Model {
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    #[sea_orm(column_name = "CreateTime", column_type = "custom(\"DATETIME\")")]
    pub create_time: String,
    #[sea_orm(column_name = "UpdateTime", column_type = "custom(\"DATETIME\")")]
    pub update_time: String,
    #[sea_orm(column_name = "MangaId")]
    pub manga_id: i32,
    #[sea_orm(column_name = "ChapterNumber")]
    pub chapter_number: f32,
    #[sea_orm(column_name = "Title", column_type = "Text")]
    pub title: String,
    #[sea_orm(column_name = "Path", column_type = "Text")]
    pub path: String,
    #[sea_orm(column_name = "PageCount")]
    pub page_count: i32,
    #[sea_orm(column_name = "ByteSize")]
    pub byte_size: i32,
    #[sea_orm(column_name = "Cover", column_type = "Text", nullable)]
    pub cover: Option<String>,
    #[sea_orm(column_name = "ImagePaths", column_type = "Text", nullable)]
    pub image_paths: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::manga::Entity",
        from = "Column::MangaId",
        to = "super::manga::Column::Id",
        on_delete = "Cascade"
    )]
    Manga,
}

impl Related<super::manga::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Manga.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    /// 创建新章节（工厂方法）
    ///
    /// # 参数
    /// - `manga_id`: 所属漫画 ID
    /// - `chapter_number`: 章节号
    /// - `title`: 章节标题
    /// - `path`: 章节路径
    /// - `page_count`: 页数
    /// - `byte_size`: 字节大小
    ///
    /// # 返回
    /// - `anyhow::Result<Self>` - 创建的章节实体
    pub fn new(
        manga_id: i32,
        chapter_number: f32,
        title: String,
        path: String,
        page_count: i32,
        byte_size: i32,
    ) -> anyhow::Result<Self> {
        // 验证业务规则
        if title.is_empty() {
            return Err(anyhow::anyhow!("Chapter title is required"));
        }
        if path.is_empty() {
            return Err(anyhow::anyhow!("Chapter path is required"));
        }
        if page_count < 0 {
            return Err(anyhow::anyhow!("Page count must be non-negative"));
        }
        if byte_size < 0 {
            return Err(anyhow::anyhow!("Byte size must be non-negative"));
        }
        if chapter_number < 0.0 {
            return Err(anyhow::anyhow!("Chapter number must be non-negative"));
        }

        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(Self {
            id: 0, // 数据库会自动生成
            manga_id,
            chapter_number,
            title,
            path,
            page_count,
            byte_size,
            cover: None,
            image_paths: None,
            create_time: now.clone(),
            update_time: now,
        })
    }

    /// 更新章节标题
    pub fn update_title(&mut self, new_title: String) -> anyhow::Result<()> {
        if new_title.is_empty() {
            return Err(anyhow::anyhow!("Chapter title is required"));
        }
        self.title = new_title;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 更新封面
    pub fn update_cover(&mut self, new_cover: Option<String>) {
        self.cover = new_cover;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 设置图片路径列表
    ///
    /// # 参数
    /// - `paths`: 图片路径列表
    pub fn set_image_paths(&mut self, paths: Vec<String>) {
        self.image_paths = Some(serde_json::to_string(&paths).unwrap());
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 获取图片路径列表
    ///
    /// # 返回
    /// - `Option<Vec<String>>` - 图片路径列表
    pub fn get_image_paths(&self) -> Option<Vec<String>> {
        self.image_paths.as_ref().and_then(|json| {
            serde_json::from_str(json).ok()
        })
    }

    /// 清除图片路径列表
    pub fn clear_image_paths(&mut self) {
        self.image_paths = None;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }
}

