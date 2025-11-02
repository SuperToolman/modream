use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 创建漫画请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateMangaRequest {
    pub title: String,
    pub description: Option<String>,
    pub path: String,
    pub page_count: i32,
    pub byte_size: i32,
    pub manga_type_string: String,
    pub author_id: Option<i32>,
    pub media_library_id: i32,
    pub cover: Option<String>,
}

/// 漫画信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MangaInfo {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub path: String,
    pub page_count: i32,
    pub byte_size: i32,
    pub manga_type_string: String,
    pub author_id: Option<i32>,
    pub media_library_id: i32,
    pub cover: Option<String>,
    pub has_chapters: bool,
    pub create_time: String,
    pub update_time: String,
}

/// 分页响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PagedResponse<T: ToSchema> {
    /// 当前页码（从 1 开始）
    #[schema(example = 1)]
    pub page_index: i32,
    /// 每页数量
    #[schema(example = 10)]
    pub page_size: i32,
    /// 总记录数
    #[schema(example = 100)]
    pub total: i32,
    /// 总页数
    #[schema(example = 10)]
    pub total_pages: i32,
    /// 当前页的数据
    pub items: Vec<T>,
}

impl<T: ToSchema> PagedResponse<T> {
    pub fn new(page_index: i32, page_size: i32, total: i32, items: Vec<T>) -> Self {
        let total_pages = (total + page_size - 1) / page_size;
        Self {
            page_index,
            page_size,
            total,
            total_pages,
            items,
        }
    }
}

/// 从 Domain 层的 Manga Model 转换为 MangaInfo DTO
impl From<domain::entity::manga::Model> for MangaInfo {
    fn from(manga: domain::entity::manga::Model) -> Self {
        MangaInfo {
            id: manga.id,
            title: manga.title,
            description: manga.description,
            path: manga.path,
            page_count: manga.page_count,
            byte_size: manga.byte_size,
            manga_type_string: manga.manga_type_string,
            author_id: manga.author_id,
            media_library_id: manga.media_library_id,
            cover: manga.cover,
            has_chapters: manga.has_chapters,
            create_time: manga.create_time,
            update_time: manga.update_time,
        }
    }
}

