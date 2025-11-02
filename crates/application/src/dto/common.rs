use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 分页查询参数
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PaginationQuery {
    /// 页码（从 1 开始），默认 1
    #[serde(default = "default_page_index")]
    pub page_index: i32,
    /// 每页数量，默认 10
    #[serde(default = "default_page_size")]
    pub page_size: i32,
}

fn default_page_index() -> i32 {
    1
}

fn default_page_size() -> i32 {
    10
}

