//! 视频扫描器 - 使用中间件模式支持多数据源

use super::models::language::Language;
use super::models::scan_mode::{ScanMode, VideoFilter};
use super::models::video::VideoScanQueryResult;
use super::provider::MetadataProvider;

/// 视频扫描器
///
/// 使用构建器模式，支持链式调用和多数据源优先级
///
/// # 示例
/// ```no_run
/// use videos_modream::MovieScan;
/// use videos_modream::models::language::Language;
/// use videos_modream::models::scan_mode::ScanMode;
///
/// #[tokio::main]
/// async fn main() {
///     let results = MovieScan::new()
///         .with_language(Language::ChineseSimplified)
///         .with_scan_mode(ScanMode::default())
///         .with_tmdb_provider("your_api_key".to_string()).await
///         .scan("./videos".to_string())
///         .await
///         .unwrap();
/// }
/// ```
pub struct MovieScan {
    /// 元数据语言
    language: Language,
    /// 扫描模式
    scan_mode: ScanMode,
    /// 元数据提供者列表（按优先级排序）
    providers: Vec<Box<dyn MetadataProvider>>,
}

impl MovieScan {
    /// 创建新的视频扫描器实例
    pub fn new() -> Self {
        Self {
            language: Language::default(),
            scan_mode: ScanMode::default(),
            providers: Vec::new(),
        }
    }

    /// 设置元数据语言
    ///
    /// # 参数
    /// * `language` - 元数据的语言类型
    pub fn with_language(mut self, language: Language) -> Self {
        self.language = language;
        self
    }

    /// 设置扫描模式
    ///
    /// # 参数
    /// * `scan_mode` - 扫描模式
    pub fn with_scan_mode(mut self, scan_mode: ScanMode) -> Self {
        self.scan_mode = scan_mode;
        self
    }

    /// 添加 TMDB 元数据提供者
    ///
    /// # 参数
    /// * `api_key` - TMDB API 密钥
    pub async fn with_tmdb_provider(mut self, api_key: String) -> Self {
        let provider = super::provider::tmdb_provider::TMDBProvider::new(api_key);
        self.providers.push(Box::new(provider));
        self
    }

    /// 添加自定义元数据提供者
    ///
    /// # 参数
    /// * `provider` - 实现了 MetadataProvider trait 的提供者
    pub fn with_provider(mut self, provider: Box<dyn MetadataProvider>) -> Self {
        self.providers.push(provider);
        self
    }

    /// 扫描指定目录中的视频文件并获取元数据
    ///
    /// 按照添加提供者的顺序依次尝试获取元数据，直到成功为止
    ///
    /// # 参数
    /// * `dir_path` - 要扫描的目录路径
    ///
    /// # 返回值
    /// 返回 `Result<Vec<VideoScanQueryResult>, String>`，包含扫描到的视频列表（含元数据）或错误信息
    pub async fn scan(self, dir_path: String) -> Result<Vec<VideoScanQueryResult>, String> {
        // 1. 扫描视频文件
        let mut video_files = self.scan_video_files(&dir_path)?;

        // 2. 如果有提供者，则补充元数据
        if !self.providers.is_empty() {
            self.enrich_with_metadata(&mut video_files).await?;
        } else {
            println!("⚠️  未配置元数据提供者，跳过元数据获取");
        }

        Ok(video_files)
    }

    /// 扫描目录中的视频文件
    fn scan_video_files(&self, dir_path: &str) -> Result<Vec<VideoScanQueryResult>, String> {
        let mode_desc = match &self.scan_mode {
            ScanMode::All => "所有视频".to_string(),
            ScanMode::MoviesOnly { min_file_size } => {
                format!("电影（智能过滤，最小 {}MB）", min_file_size / 1024 / 1024)
            }
        };
        println!("📂 扫描目录: {} (模式: {})", dir_path, mode_desc);

        let mut video_files = Vec::<VideoScanQueryResult>::new();
        let mut filtered_count = 0;

        let video_extensions = [
            "mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "m4v", "mpg", "mpeg", "3gp", "ts",
            "mts", "vob", "ogv", "divx",
        ];

        for result in ignore::Walk::new(dir_path) {
            match result {
                Ok(entry) => {
                    if let Some(file_type) = entry.file_type() {
                        if file_type.is_file() {
                            if let Some(extension) = entry.path().extension() {
                                let ext_str = extension.to_string_lossy().to_lowercase();
                                if video_extensions.contains(&ext_str.as_str()) {
                                    let file_path =
                                        entry.path().to_string_lossy().to_string();
                                    let file_name = entry
                                        .path()
                                        .file_name()
                                        .unwrap()
                                        .to_string_lossy()
                                        .to_string();

                                    // 获取文件大小
                                    let file_size = entry.metadata().map(|m| m.len()).unwrap_or(0);

                                    // 根据扫描模式决定是否包含此文件
                                    let should_include = match &self.scan_mode {
                                        ScanMode::All => true,
                                        ScanMode::MoviesOnly { min_file_size } => {
                                            let is_movie = VideoFilter::is_likely_movie(
                                                &file_name,
                                                file_size,
                                                *min_file_size,
                                            );
                                            if !is_movie {
                                                filtered_count += 1;
                                                println!("  ⏭️  跳过: {} (不像电影)", file_name);
                                            }
                                            is_movie
                                        }
                                    };

                                    if should_include {
                                        // 提取清理后的标题
                                        let clean_title = match &self.scan_mode {
                                            ScanMode::MoviesOnly { .. } => {
                                                VideoFilter::extract_movie_title(&file_name)
                                            }
                                            ScanMode::All => {
                                                // 移除扩展名
                                                if let Some(pos) = file_name.rfind('.') {
                                                    file_name[..pos].to_string()
                                                } else {
                                                    file_name.clone()
                                                }
                                            }
                                        };

                                        let mut video =
                                            VideoScanQueryResult::new(file_name, file_path);
                                        video.title = clean_title; // 使用清理后的标题
                                        video_files.push(video);
                                    }
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    return Err(format!("扫描错误: {}", e));
                }
            }
        }

        if filtered_count > 0 {
            println!("🔍 过滤掉 {} 个非电影文件", filtered_count);
        }
        println!("✅ 找到 {} 个视频文件", video_files.len());
        Ok(video_files)
    }

    /// 使用配置的提供者补充元数据
    async fn enrich_with_metadata(
        &self,
        video_files: &mut [VideoScanQueryResult],
    ) -> Result<(), String> {
        println!(
            "\n📡 开始从 {} 个数据源获取元数据（语言: {}）...",
            self.providers.len(),
            self.language.display_name()
        );

        for video in video_files.iter_mut() {
            println!("\n🔍 搜索: {}", video.title);

            // 按优先级依次尝试每个提供者
            let mut found = false;
            for (index, provider) in self.providers.iter().enumerate() {
                println!(
                    "  📍 尝试数据源 #{} ({})...",
                    index + 1,
                    provider.name()
                );

                match provider
                    .search_with_language(&video.title, None, self.language)
                    .await
                {
                    Ok(results) if !results.is_empty() => {
                        println!("  ✅ 找到 {} 个结果", results.len());

                        // 使用第一个匹配结果
                        if let Some(first_result) = results.first() {
                            println!(
                                "    ✅ 找到匹配: {} ({})",
                                first_result.title, first_result.release_date
                            );
                            println!("    📡 获取详细信息...");

                            // 获取详细信息
                            match provider
                                .get_details_with_language(first_result.tmdb_id, self.language)
                                .await
                            {
                                Ok(details) => {
                                    // 填充视频详情
                                    video.description = details.overview;
                                    video.release_date = details.release_date;
                                    video.rating = details.vote_average as f32;
                                    video.votes = details.vote_count as u32;
                                    video.genres = details.genres;
                                    video.actors = details.cast;
                                    video.directors = details.directors;
                                    video.writers = details.writers;
                                    video.producers = details.producers;
                                    video.tags = details.keywords;
                                    video.poster_urls = details.poster_urls;

                                    println!("    ✅ 详细信息获取成功");
                                    found = true;
                                    break; // 成功获取，跳出提供者循环
                                }
                                Err(e) => {
                                    println!("    ⚠️  获取详情失败: {}", e);
                                }
                            }
                        }
                    }
                    Ok(_) => {
                        println!("  ⚠️  未找到匹配结果");
                    }
                    Err(e) => {
                        println!("  ⚠️  搜索失败: {}", e);
                    }
                }
            }

            if !found {
                println!("  ❌ 所有数据源均未找到匹配结果");
            }
        }

        println!("\n✅ 元数据获取完成！");
        Ok(())
    }
}

impl Default for MovieScan {
    fn default() -> Self {
        Self::new()
    }
}

