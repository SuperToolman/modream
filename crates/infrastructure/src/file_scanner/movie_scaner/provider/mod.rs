use async_trait::async_trait;

pub mod tmdb_provider;

/// 搜索元数据结果
///
/// 从 TMDB API 搜索返回的电影元数据
#[derive(Debug, Clone)]
pub struct SearchMetadataResult {
    /// TMDB 电影 ID
    pub tmdb_id: u64,
    /// 电影标题
    pub title: String,
    /// 原始标题
    pub original_title: String,
    /// 电影简介
    pub overview: String,
    /// 发行日期（格式：YYYY-MM-DD）
    pub release_date: String,
    /// 海报图片路径（相对路径，需要拼接基础 URL）
    pub poster_path: Option<String>,
    /// 背景图片路径（相对路径，需要拼接基础 URL）
    pub backdrop_path: Option<String>,
    /// 平均评分（0-10）
    pub vote_average: f64,
    /// 投票数量
    pub vote_count: u64,
    /// 流行度分数
    pub popularity: f64,
    /// 原始语言代码（如 "en", "zh"）
    pub original_language: String,
    /// 类型 ID 列表
    pub genre_ids: Vec<u32>,
    /// 是否为成人内容
    pub adult: bool,
}

impl SearchMetadataResult {
    /// 获取完整的海报 URL
    ///
    /// # 参数
    /// * `size` - 图片尺寸，可选值：w92, w154, w185, w342, w500, w780, original
    pub fn get_poster_url(&self, size: &str) -> Option<String> {
        self.poster_path.as_ref().map(|path| {
            format!("https://image.tmdb.org/t/p/{}{}", size, path)
        })
    }

    /// 获取完整的背景图 URL
    ///
    /// # 参数
    /// * `size` - 图片尺寸，可选值：w300, w780, w1280, original
    pub fn get_backdrop_url(&self, size: &str) -> Option<String> {
        self.backdrop_path.as_ref().map(|path| {
            format!("https://image.tmdb.org/t/p/{}{}", size, path)
        })
    }
}

/// 电影详细信息
///
/// 从 TMDB API 详情接口返回的完整电影信息
#[derive(Debug, Clone)]
pub struct MovieDetails {
    /// TMDB 电影 ID
    pub tmdb_id: u64,
    /// 电影标题
    pub title: String,
    /// 原始标题
    pub original_title: String,
    /// 电影简介
    pub overview: String,
    /// 发行日期（格式：YYYY-MM-DD）
    pub release_date: String,
    /// 海报图片路径
    pub poster_path: Option<String>,
    /// 背景图片路径
    pub backdrop_path: Option<String>,
    /// 平均评分（0-10）
    pub vote_average: f64,
    /// 投票数量
    pub vote_count: u64,
    /// 流行度分数
    pub popularity: f64,
    /// 原始语言代码
    pub original_language: String,
    /// 是否为成人内容
    pub adult: bool,
    /// 类型列表（名称）
    pub genres: Vec<String>,
    /// 演员列表
    pub cast: Vec<String>,
    /// 导演列表
    pub directors: Vec<String>,
    /// 编剧列表
    pub writers: Vec<String>,
    /// 制片人列表
    pub producers: Vec<String>,
    /// 标签/关键词
    pub keywords: Vec<String>,
    /// 海报 URL 列表
    pub poster_urls: Vec<String>,
}

impl MovieDetails {
    /// 获取完整的海报 URL
    pub fn get_poster_url(&self, size: &str) -> Option<String> {
        self.poster_path.as_ref().map(|path| {
            format!("https://image.tmdb.org/t/p/{}{}", size, path)
        })
    }

    /// 获取完整的背景图 URL
    pub fn get_backdrop_url(&self, size: &str) -> Option<String> {
        self.backdrop_path.as_ref().map(|path| {
            format!("https://image.tmdb.org/t/p/{}{}", size, path)
        })
    }
}

/// 元数据提供者 trait
///
/// 所有元数据提供者必须实现此 trait
/// 支持多数据源和优先级排序
#[async_trait]
pub trait MetadataProvider: Send + Sync {
    /// 获取提供者名称
    fn name(&self) -> &str;

    /// 搜索电影
    async fn search(&self, title: &str, year: Option<u64>) -> Result<Vec<SearchMetadataResult>, String>;

    /// 获取电影详细信息
    async fn get_details(&self, tmdb_id: u64) -> Result<MovieDetails, String>;

    /// 使用指定语言搜索电影
    async fn search_with_language(
        &self,
        title: &str,
        year: Option<u64>,
        language: super::models::language::Language,
    ) -> Result<Vec<SearchMetadataResult>, String>;

    /// 使用指定语言获取电影详情
    async fn get_details_with_language(
        &self,
        id: u64,
        language: super::models::language::Language,
    ) -> Result<MovieDetails, String>;
}

/// 旧的 trait 别名，保持向后兼容
#[async_trait]
pub trait MovieMetadataProvider: Send + Sync {
    /// 搜索电影
    async fn search(&self, title: &str, year: Option<u64>) -> Result<Vec<SearchMetadataResult>, String>;

    /// 获取电影详细信息
    async fn get_details(&self, tmdb_id: u64) -> Result<MovieDetails, String>;
}
