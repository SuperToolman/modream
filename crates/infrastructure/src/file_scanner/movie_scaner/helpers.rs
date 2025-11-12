//! 便捷函数
//!
//! 提供简化的 API，用于快速扫描视频文件并获取元数据。
//! 这些函数内部使用 MovieScan 构建器，避免代码重复。

use super::models::language::Language;
use super::models::scan_mode::ScanMode;
use super::models::video::VideoScanQueryResult;
use super::scanner::MovieScan;

/// 扫描指定目录中的视频文件并自动获取 TMDB 元数据
///
/// 默认使用简体中文，只扫描可能是电影的视频文件（智能过滤）
///
/// # 参数
/// * `dir_path` - 要扫描的目录路径
///
/// # 返回值
/// 返回 `Result<Vec<VideoScanQueryResult>, String>`，包含扫描到的视频列表（含元数据）或错误信息
///
/// # 示例
/// ```no_run
/// use videos_modream::video_scan;
///
/// #[tokio::main]
/// async fn main() {
///     let results = video_scan("./videos".to_string()).await.unwrap();
///     for video in results {
///         println!("{}: {}", video.title, video.description);
///     }
/// }
/// ```
pub async fn video_scan(dir_path: String) -> Result<Vec<VideoScanQueryResult>, String> {
    video_scan_with_options(dir_path, Language::default(), ScanMode::default()).await
}

/// 扫描指定目录中的视频文件并使用指定语言获取 TMDB 元数据
///
/// # 参数
/// * `dir_path` - 要扫描的目录路径
/// * `language` - 元数据的语言类型
///
/// # 返回值
/// 返回 `Result<Vec<VideoScanQueryResult>, String>`，包含扫描到的视频列表（含元数据）或错误信息
///
/// # 示例
/// ```no_run
/// use videos_modream::{video_scan_with_language, models::language::Language};
///
/// #[tokio::main]
/// async fn main() {
///     // 使用简体中文
///     let results_cn = video_scan_with_language(
///         "./videos".to_string(),
///         Language::ChineseSimplified
///     ).await;
///
///     // 使用英语
///     let results_en = video_scan_with_language(
///         "./videos".to_string(),
///         Language::English
///     ).await;
/// }
/// ```
pub async fn video_scan_with_language(
    dir_path: String,
    language: Language,
) -> Result<Vec<VideoScanQueryResult>, String> {
    video_scan_with_options(dir_path, language, ScanMode::default()).await
}

/// 扫描指定目录中的视频文件并使用完整选项获取 TMDB 元数据
///
/// # 参数
/// * `dir_path` - 要扫描的目录路径
/// * `language` - 元数据的语言类型
/// * `scan_mode` - 扫描模式
///   - `ScanMode::All`: 扫描所有视频文件
///   - `ScanMode::MoviesOnly { min_file_size }`: 只扫描可能是电影的视频（智能过滤）
///
/// # 返回值
/// 返回 `Result<Vec<VideoScanQueryResult>, String>`，包含扫描到的视频列表（含元数据）或错误信息
///
/// # 示例
/// ```no_run
/// use videos_modream::{video_scan_with_options, models::language::Language, models::scan_mode::ScanMode};
///
/// #[tokio::main]
/// async fn main() {
///     // 扫描所有视频
///     let all_videos = video_scan_with_options(
///         "./videos".to_string(),
///         Language::ChineseSimplified,
///         ScanMode::All
///     ).await;
///
///     // 只扫描可能是电影的视频（默认 300MB）
///     let movies_default = video_scan_with_options(
///         "./videos".to_string(),
///         Language::English,
///         ScanMode::default()
///     ).await;
///
///     // 自定义最小文件大小（500MB）
///     let movies_custom = video_scan_with_options(
///         "./videos".to_string(),
///         Language::English,
///         ScanMode::movies_only_with_min_size(500)
///     ).await;
/// }
/// ```
pub async fn video_scan_with_options(
    dir_path: String,
    language: Language,
    scan_mode: ScanMode,
) -> Result<Vec<VideoScanQueryResult>, String> {
    // 从配置中读取 TMDB API Key
    let tmdb_api_key = shared::config::get().movie().tmdb().api_key().to_string();

    // 使用 MovieScan 构建器执行扫描
    MovieScan::new()
        .with_language(language)
        .with_scan_mode(scan_mode)
        .with_tmdb_provider(tmdb_api_key).await
        .scan(dir_path)
        .await
}


#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_video_scan_chinese() {
        println!("\n🎬 测试：使用简体中文获取元数据");
        let result = video_scan("G:/Systeam/Videos/test_scan".to_string()).await;

        match result {
            Ok(videos) => {
                println!("\n📊 扫描结果汇总:");
                println!("{}", "=".repeat(60));

                for (index, video) in videos.iter().enumerate() {
                    println!("\n{}. {}", index, video.title);
                    println!("   路径: {}", video.path);
                    println!("   简介: {}", video.description);
                    println!("   发行日期: {}", video.release_date);
                    println!("   评分: {:.1}/10 ({} 票)", video.rating, video.votes);
                    println!("   类型: {:?}", video.genres);
                    println!("   导演: {:?}", video.directors);
                    println!("   演员: {:?}", video.actors);
                    println!("   编剧: {:?}", video.writers);
                    println!("   制片人: {:?}", video.producers);
                    println!("   标签: {:?}", video.tags);
                    println!("   海报 URL: {:?}", video.poster_urls);
                }
            }
            Err(e) => {
                panic!("测试失败: {}", e);
            }
        }
    }
}

