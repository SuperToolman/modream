use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 章节信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MangaChapterInfo {
    pub id: i32,
    pub manga_id: i32,
    pub chapter_number: f32,
    pub title: String,
    pub path: String,
    pub page_count: i32,
    pub byte_size: i32,
    pub cover: Option<String>,
    pub create_time: String,
    pub update_time: String,
}

/// 从 Domain 层的 MangaChapter Model 转换为 MangaChapterInfo DTO
impl From<domain::entity::manga_chapter::Model> for MangaChapterInfo {
    fn from(chapter: domain::entity::manga_chapter::Model) -> Self {
        MangaChapterInfo {
            id: chapter.id,
            manga_id: chapter.manga_id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            path: chapter.path,
            page_count: chapter.page_count,
            byte_size: chapter.byte_size,
            cover: chapter.cover,
            create_time: chapter.create_time,
            update_time: chapter.update_time,
        }
    }
}

/// 优化的章节图片列表响应（减少数据传输）
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct OptimizedChapterImageListResponse {
    /// 图片总数
    #[schema(example = 50)]
    pub count: i32,
    /// URL 模板，前端可以用 {index} 替换为实际索引
    /// 例如："/api/manga_chapter/12/5/images/{index}"
    #[schema(example = "/api/manga_chapter/12/5/images/{index}")]
    pub url_template: String,
}

