use super::{MovieMetadataProvider, MetadataProvider, MovieDetails};
use super::SearchMetadataResult;
use super::super::models::language::Language;
use serde::{Deserialize, Serialize};

/// TMDB API 搜索响应
#[derive(Debug, Deserialize, Serialize)]
struct TMDBSearchResponse {
    page: u32,
    results: Vec<TMDBMovie>,
    total_pages: u32,
    total_results: u32,
}

/// TMDB 电影信息
#[derive(Debug, Deserialize, Serialize, Clone)]
struct TMDBMovie {
    id: u64,
    title: String,
    original_title: String,
    overview: Option<String>,
    release_date: Option<String>,
    poster_path: Option<String>,
    backdrop_path: Option<String>,
    vote_average: Option<f64>,
    vote_count: Option<u64>,
    popularity: Option<f64>,
    original_language: Option<String>,
    genre_ids: Option<Vec<u32>>,
    adult: Option<bool>,
}

impl TMDBMovie {
    /// 转换为 SearchMetadataResult
    fn to_search_result(&self) -> SearchMetadataResult {
        SearchMetadataResult {
            tmdb_id: self.id,
            title: self.title.clone(),
            original_title: self.original_title.clone(),
            overview: self.overview.clone().unwrap_or_default(),
            release_date: self.release_date.clone().unwrap_or_default(),
            poster_path: self.poster_path.clone(),
            backdrop_path: self.backdrop_path.clone(),
            vote_average: self.vote_average.unwrap_or(0.0),
            vote_count: self.vote_count.unwrap_or(0),
            popularity: self.popularity.unwrap_or(0.0),
            original_language: self.original_language.clone().unwrap_or_default(),
            genre_ids: self.genre_ids.clone().unwrap_or_default(),
            adult: self.adult.unwrap_or(false),
        }
    }
}

/// TMDB 电影详情响应
#[derive(Debug, Deserialize, Serialize)]
struct TMDBMovieDetails {
    id: u64,
    title: String,
    original_title: String,
    overview: Option<String>,
    release_date: Option<String>,
    poster_path: Option<String>,
    backdrop_path: Option<String>,
    vote_average: Option<f64>,
    vote_count: Option<u64>,
    popularity: Option<f64>,
    original_language: Option<String>,
    adult: Option<bool>,
    genres: Option<Vec<TMDBGenre>>,
    credits: Option<TMDBCredits>,
    keywords: Option<TMDBKeywords>,
}

/// TMDB 类型
#[derive(Debug, Deserialize, Serialize)]
struct TMDBGenre {
    id: u32,
    name: String,
}

/// TMDB 演职人员信息
#[derive(Debug, Deserialize, Serialize)]
struct TMDBCredits {
    cast: Option<Vec<TMDBCast>>,
    crew: Option<Vec<TMDBCrew>>,
}

/// TMDB 演员
#[derive(Debug, Deserialize, Serialize)]
struct TMDBCast {
    name: String,
    character: Option<String>,
    order: Option<u32>,
}

/// TMDB 工作人员
#[derive(Debug, Deserialize, Serialize)]
struct TMDBCrew {
    name: String,
    job: String,
    department: Option<String>,
}

/// TMDB 关键词
#[derive(Debug, Deserialize, Serialize)]
struct TMDBKeywords {
    keywords: Option<Vec<TMDBKeyword>>,
}

/// TMDB 关键词项
#[derive(Debug, Deserialize, Serialize)]
struct TMDBKeyword {
    id: u32,
    name: String,
}

impl TMDBMovieDetails {
    /// 转换为 MovieDetails
    fn to_movie_details(&self) -> MovieDetails {
        // 提取类型名称
        let genres = self.genres.as_ref()
            .map(|g| g.iter().map(|genre| genre.name.clone()).collect())
            .unwrap_or_default();

        // 提取演员（前10位）
        let actors = self.credits.as_ref()
            .and_then(|c| c.cast.as_ref())
            .map(|cast| {
                cast.iter()
                    .take(10)
                    .map(|actor| actor.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // 提取导演
        let directors = self.credits.as_ref()
            .and_then(|c| c.crew.as_ref())
            .map(|crew| {
                crew.iter()
                    .filter(|person| person.job == "Director")
                    .map(|person| person.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // 提取编剧
        let writers = self.credits.as_ref()
            .and_then(|c| c.crew.as_ref())
            .map(|crew| {
                crew.iter()
                    .filter(|person| {
                        person.job == "Writer" ||
                        person.job == "Screenplay" ||
                        person.job == "Story"
                    })
                    .map(|person| person.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // 提取制片人
        let producers = self.credits.as_ref()
            .and_then(|c| c.crew.as_ref())
            .map(|crew| {
                crew.iter()
                    .filter(|person| person.job == "Producer")
                    .map(|person| person.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // 提取关键词
        let tags = self.keywords.as_ref()
            .and_then(|k| k.keywords.as_ref())
            .map(|keywords| {
                keywords.iter()
                    .map(|keyword| keyword.name.clone())
                    .collect()
            })
            .unwrap_or_default();

        // 构建海报 URL 列表（包含多种尺寸）
        let mut poster_urls = Vec::new();
        if let Some(poster_path) = &self.poster_path {
            // 添加多种尺寸的海报 URL
            poster_urls.push(format!("https://image.tmdb.org/t/p/w500{}", poster_path));
            poster_urls.push(format!("https://image.tmdb.org/t/p/w780{}", poster_path));
            poster_urls.push(format!("https://image.tmdb.org/t/p/original{}", poster_path));
        }
        if let Some(backdrop_path) = &self.backdrop_path {
            // 添加背景图 URL
            poster_urls.push(format!("https://image.tmdb.org/t/p/w1280{}", backdrop_path));
            poster_urls.push(format!("https://image.tmdb.org/t/p/original{}", backdrop_path));
        }

        MovieDetails {
            tmdb_id: self.id,
            title: self.title.clone(),
            original_title: self.original_title.clone(),
            overview: self.overview.clone().unwrap_or_default(),
            release_date: self.release_date.clone().unwrap_or_default(),
            poster_path: self.poster_path.clone(),
            backdrop_path: self.backdrop_path.clone(),
            vote_average: self.vote_average.unwrap_or(0.0),
            vote_count: self.vote_count.unwrap_or(0),
            popularity: self.popularity.unwrap_or(0.0),
            original_language: self.original_language.clone().unwrap_or_default(),
            adult: self.adult.unwrap_or(false),
            genres,
            cast: actors,
            directors,
            writers,
            producers,
            keywords: tags,
            poster_urls,
        }
    }
}

pub struct TMDBProvider {
    api_key: String,
    client: reqwest::Client,
}

impl TMDBProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    /// 使用指定语言搜索电影
    pub async fn search_with_language(
        &self,
        title: &str,
        year: Option<u64>,
        language: Language,
    ) -> Result<Vec<SearchMetadataResult>, String> {
        let mut url = format!(
            "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&language={}",
            self.api_key,
            urlencoding::encode(title),
            language.code()
        );

        if let Some(y) = year {
            url.push_str(&format!("&year={}", y));
        }

        println!("🔍 请求 URL: {}", url);

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        let status = response.status();
        println!("📡 响应状态: {}", status);

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            return Err(format!("API 返回错误 {}: {}", status, error_text));
        }

        let search_result: TMDBSearchResponse = response
            .json()
            .await
            .map_err(|e| format!("解析 JSON 失败: {}", e))?;

        println!("✅ 找到 {} 个结果", search_result.results.len());
        for movie in &search_result.results {
            println!("  - {} ({}) - 评分: {:.1}/10",
                movie.title,
                movie.release_date.as_ref().unwrap_or(&"未知".to_string()),
                movie.vote_average.unwrap_or(0.0)
            );
        }

        Ok(search_result.results.iter().map(|m| m.to_search_result()).collect())
    }

    /// 使用指定语言获取电影详细信息
    pub async fn get_details_with_language(
        &self,
        tmdb_id: u64,
        language: Language,
    ) -> Result<MovieDetails, String> {
        let url = format!(
            "https://api.themoviedb.org/3/movie/{}?api_key={}&language={}&append_to_response=credits,keywords",
            tmdb_id,
            self.api_key,
            language.code()
        );

        println!("🔍 请求详情 URL: {}", url);

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        let status = response.status();
        println!("📡 响应状态: {}", status);

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            return Err(format!("API 返回错误 {}: {}", status, error_text));
        }

        let movie_details: TMDBMovieDetails = response
            .json()
            .await
            .map_err(|e| format!("解析 JSON 失败: {}", e))?;

        println!("✅ 获取详情成功: {}", movie_details.title);

        Ok(movie_details.to_movie_details())
    }
}

#[async_trait::async_trait]
impl MovieMetadataProvider for TMDBProvider {
    async fn search(&self, title: &str, year: Option<u64>) -> Result<Vec<SearchMetadataResult>, String> {
        let mut url = format!(
            "https://api.themoviedb.org/3/search/movie?api_key={}&query={}",
            self.api_key,
            urlencoding::encode(title)
        );

        if let Some(y) = year {
            url.push_str(&format!("&year={}", y));
        }

        println!("🔍 请求 URL: {}", url);

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        let status = response.status();
        println!("📡 响应状态: {}", status);

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            return Err(format!("API 返回错误 {}: {}", status, error_text));
        }

        let search_result: TMDBSearchResponse = response
            .json()
            .await
            .map_err(|e| format!("解析 JSON 失败: {}", e))?;

        println!("✅ 找到 {} 个结果", search_result.results.len());
        for movie in &search_result.results {
            println!("  - {} ({}) - 评分: {:.1}/10",
                movie.title,
                movie.release_date.as_ref().unwrap_or(&"未知".to_string()),
                movie.vote_average.unwrap_or(0.0)
            );
        }

        // 将 TMDB 的搜索结果转换为 SearchMetadataResult
        let results: Vec<SearchMetadataResult> = search_result.results
            .iter()
            .map(|movie| movie.to_search_result())
            .collect();

        Ok(results)
    }

    async fn get_details(&self, tmdb_id: u64) -> Result<MovieDetails, String> {
        // 构建详情 API URL，附加 credits 和 keywords
        let url = format!(
            "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits,keywords",
            tmdb_id,
            self.api_key
        );

        println!("🔍 请求详情 URL: {}", url);

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        let status = response.status();
        println!("📡 响应状态: {}", status);

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            return Err(format!("API 返回错误 {}: {}", status, error_text));
        }

        let movie_details: TMDBMovieDetails = response
            .json()
            .await
            .map_err(|e| format!("解析 JSON 失败: {}", e))?;

        println!("✅ 获取详情成功: {}", movie_details.title);

        Ok(movie_details.to_movie_details())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_movie_details() {
        // 从配置中读取 TMDB API Key
        let tmdb_api_key = shared::config::get().movie().tmdb().api_key().to_string();
        let provider = TMDBProvider::new(tmdb_api_key);

        // 使用 Interstellar 的 TMDB ID: 157336
        let result = MovieMetadataProvider::get_details(&provider, 157336).await;

        assert!(result.is_ok());

        let details = result.unwrap();
        println!("\n📽️ 电影详情:");
        println!("  标题: {}", details.title);
        println!("  发行日期: {}", details.release_date);
        println!("  评分: {:.1}/10 ({} 票)", details.vote_average, details.vote_count);
        println!("  类型: {:?}", details.genres);
        println!("  导演: {:?}", details.directors);
        println!("  编剧: {:?}", details.writers);
        println!("  制片人: {:?}", details.producers);
        println!("  演员: {:?}", details.cast);
        println!("  标签: {:?}", details.keywords);

        // 验证关键字段不为空
        assert!(!details.title.is_empty());
        assert!(!details.genres.is_empty());
        assert!(!details.directors.is_empty());
        assert!(!details.cast.is_empty());
    }
}

// 实现 MetadataProvider trait
#[async_trait::async_trait]
impl MetadataProvider for TMDBProvider {
    fn name(&self) -> &str {
        "TMDB"
    }

    async fn search(&self, title: &str, year: Option<u64>) -> Result<Vec<SearchMetadataResult>, String> {
        TMDBProvider::search_with_language(self, title, year, Language::default()).await
    }

    async fn get_details(&self, tmdb_id: u64) -> Result<MovieDetails, String> {
        TMDBProvider::get_details_with_language(self, tmdb_id, Language::default()).await
    }

    async fn search_with_language(
        &self,
        title: &str,
        year: Option<u64>,
        language: Language,
    ) -> Result<Vec<SearchMetadataResult>, String> {
        TMDBProvider::search_with_language(self, title, year, language).await
    }

    async fn get_details_with_language(
        &self,
        id: u64,
        language: Language,
    ) -> Result<MovieDetails, String> {
        TMDBProvider::get_details_with_language(self, id, language).await
    }
}
