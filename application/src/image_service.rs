use domain::repository::{MangaRepository, MangaChapterRepository};
use moka::future::Cache;
use std::sync::Arc;
use std::time::Duration;

/// 图片服务 - 处理漫画图片相关的业务逻辑
pub struct ImageService {
    manga_repo: Arc<dyn MangaRepository>,
    manga_chapter_repo: Arc<dyn MangaChapterRepository>,
    /// 图片列表缓存：Key = manga_id, Value = Vec<图片路径>
    /// TTL: 5 分钟，最大容量: 1000 个漫画
    image_list_cache: Cache<i32, Arc<Vec<String>>>,
    /// Manga 实体缓存：Key = manga_id, Value = Manga
    /// TTL: 5 分钟，最大容量: 1000 个漫画
    manga_cache: Cache<i32, Arc<domain::entity::manga::Model>>,
    /// 章节图片列表缓存：Key = chapter_id, Value = Vec<图片路径>
    /// TTL: 5 分钟，最大容量: 1000 个章节
    chapter_image_list_cache: Cache<i32, Arc<Vec<String>>>,
    /// 章节实体缓存：Key = chapter_id, Value = MangaChapter
    /// TTL: 5 分钟，最大容量: 1000 个章节
    chapter_cache: Cache<i32, Arc<domain::entity::manga_chapter::Model>>,
}

impl ImageService {
    /// 创建新的图片服务实例
    pub fn new(
        manga_repo: Arc<dyn MangaRepository>,
        manga_chapter_repo: Arc<dyn MangaChapterRepository>,
    ) -> Self {
        Self {
            manga_repo,
            manga_chapter_repo,
            // 图片列表缓存：5 分钟 TTL，最多缓存 1000 个漫画的图片列表
            image_list_cache: Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(300)) // 5 分钟
                .build(),
            // Manga 实体缓存：5 分钟 TTL，最多缓存 1000 个漫画实体
            manga_cache: Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(300)) // 5 分钟
                .build(),
            // 章节图片列表缓存：5 分钟 TTL，最多缓存 1000 个章节的图片列表
            chapter_image_list_cache: Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(300)) // 5 分钟
                .build(),
            // 章节实体缓存：5 分钟 TTL，最多缓存 1000 个章节实体
            chapter_cache: Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(300)) // 5 分钟
                .build(),
        }
    }

    /// 获取漫画的所有图片列表（带缓存）
    pub async fn get_manga_images(&self, manga_id: i32) -> anyhow::Result<Vec<String>> {
        // 先尝试从缓存获取
        if let Some(cached_images) = self.image_list_cache.get(&manga_id).await {
            tracing::debug!("Image list cache hit for manga_id: {}", manga_id);
            return Ok((*cached_images).clone());
        }

        tracing::debug!("Image list cache miss for manga_id: {}", manga_id);

        // 缓存未命中，从数据库获取 manga 信息
        let manga = self.get_manga_from_cache_or_db(manga_id).await?;

        // 异步扫描文件夹获取图片列表
        let images = self.scan_images_in_folder(&manga.path).await?;

        // 存入缓存
        self.image_list_cache.insert(manga_id, Arc::new(images.clone())).await;

        Ok(images)
    }

    /// 从缓存或数据库获取 Manga 实体
    async fn get_manga_from_cache_or_db(&self, manga_id: i32) -> anyhow::Result<Arc<domain::entity::manga::Model>> {
        // 先尝试从缓存获取
        if let Some(cached_manga) = self.manga_cache.get(&manga_id).await {
            tracing::debug!("Manga cache hit for manga_id: {}", manga_id);
            return Ok(cached_manga);
        }

        tracing::debug!("Manga cache miss for manga_id: {}", manga_id);

        // 缓存未命中，从数据库查询
        let manga = self.manga_repo.find_by_id(manga_id).await?
            .ok_or_else(|| anyhow::anyhow!("Manga not found"))?;

        let manga_arc = Arc::new(manga);

        // 存入缓存
        self.manga_cache.insert(manga_id, manga_arc.clone()).await;

        Ok(manga_arc)
    }

    /// 获取漫画的第 N 张图片的路径（用于流式传输）
    pub async fn get_manga_image_path(&self, manga_id: i32, index: i32) -> anyhow::Result<String> {
        let images = self.get_manga_images(manga_id).await?;

        if index < 0 || index >= images.len() as i32 {
            return Err(anyhow::anyhow!("Image index out of range"));
        }

        Ok(images[index as usize].clone())
    }

    /// 获取漫画的第 N 张图片（完整数据）
    /// 注意：这个方法会将整个文件加载到内存，大文件建议使用 get_manga_image_path + 流式传输
    pub async fn get_manga_image(&self, manga_id: i32, index: i32) -> anyhow::Result<Vec<u8>> {
        let image_path = self.get_manga_image_path(manga_id, index).await?;

        // ✅ 使用异步 IO，不阻塞运行时
        tokio::fs::read(&image_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read image: {}", e))
    }

    /// 获取漫画的封面路径（用于流式传输，带缓存）
    ///
    /// 如果 cover 字段是 API 路径格式（如 `/manga/1/cover`），则获取漫画文件夹中的第一张图片
    /// 否则直接使用 cover 字段作为文件系统路径
    pub async fn get_manga_cover_path(&self, manga_id: i32) -> anyhow::Result<String> {
        // 从缓存或数据库获取 manga 信息
        let manga = self.get_manga_from_cache_or_db(manga_id).await?;

        // 如果 cover 是 API 路径格式（以 / 开头），则获取第一张图片
        if let Some(cover) = &manga.cover {
            if cover.starts_with("/manga/") || cover.starts_with("/api/manga/") {
                // 这是 API 路径格式，使用缓存的图片列表获取第一张图片
                let images = self.get_manga_images(manga_id).await?;
                return images.first()
                    .cloned()
                    .ok_or_else(|| anyhow::anyhow!("No images found in manga folder"));
            } else {
                // 这是真实的文件系统路径
                return Ok(cover.clone());
            }
        }

        // 如果没有 cover 字段，使用缓存的图片列表获取第一张图片
        let images = self.get_manga_images(manga_id).await?;
        images.first()
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("No images found in manga folder"))
    }

    /// 获取漫画的封面（完整数据）
    /// 注意：这个方法会将整个文件加载到内存，大文件建议使用 get_manga_cover_path + 流式传输
    pub async fn get_manga_cover(&self, manga_id: i32) -> anyhow::Result<Vec<u8>> {
        let cover_path = self.get_manga_cover_path(manga_id).await?;

        // ✅ 使用异步 IO，不阻塞运行时
        tokio::fs::read(&cover_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read cover: {}", e))
    }

    /// 获取漫画的封面缩略图（带磁盘缓存）
    ///
    /// # 参数
    /// - `manga_id`: 漫画 ID
    /// - `width`: 缩略图宽度（像素），使用配置中的默认值
    /// - `height`: 缩略图高度（像素），使用配置中的默认值
    /// - `quality`: 图片质量（0-100），使用配置中的默认值
    ///
    /// # 缓存策略
    /// - 缩略图保存在 `./cache/thumbnails/` 目录
    /// - 文件名格式：`{manga_id}_{width}x{height}_q{quality}.jpg`
    /// - 如果缓存文件存在且原图未修改，直接返回缓存
    pub async fn get_manga_cover_thumbnail(
        &self,
        manga_id: i32,
        width: Option<u32>,
        height: Option<u32>,
        quality: Option<u8>,
    ) -> anyhow::Result<Vec<u8>> {
        // 从配置中获取默认值
        let config = shared::config::get().server().image().thumbnail();
        let width = width.unwrap_or_else(|| config.default_width());
        let height = height.unwrap_or_else(|| config.default_height());
        let quality = quality.unwrap_or_else(|| config.default_quality());

        // 生成缓存文件路径（统一放在 data 目录下）
        let cache_dir = std::path::Path::new("./data/cache/thumbnails");
        let cache_filename = format!("{}_{}x{}_q{}.jpg", manga_id, width, height, quality);
        let cache_path = cache_dir.join(&cache_filename);

        // 异步检查缓存是否存在
        if tokio::fs::try_exists(&cache_path).await.unwrap_or(false) {
            tracing::debug!("Thumbnail cache hit for manga_id: {}, {}x{}", manga_id, width, height);
            // 从缓存读取
            match tokio::fs::read(&cache_path).await {
                Ok(data) => return Ok(data),
                Err(e) => {
                    tracing::warn!("Failed to read thumbnail cache: {}, regenerating", e);
                }
            }
        }

        tracing::debug!("Thumbnail cache miss for manga_id: {}, {}x{}", manga_id, width, height);

        // 缓存未命中，获取原图路径
        let cover_path = self.get_manga_cover_path(manga_id).await?;

        // 读取原始图片
        let image_data = tokio::fs::read(&cover_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read cover: {}", e))?;

        // 在线程池中进行 CPU 密集的图片处理
        let thumbnail = tokio::task::spawn_blocking(move || {
            compress_image(&image_data, width, height, quality)
        })
        .await
        .map_err(|e| anyhow::anyhow!("Task join error: {}", e))??;

        // 保存到缓存（异步，不阻塞返回）
        let cache_path_clone = cache_path.clone();
        let thumbnail_clone = thumbnail.clone();
        tokio::spawn(async move {
            // 确保缓存目录存在
            if let Err(e) = tokio::fs::create_dir_all(cache_dir).await {
                tracing::warn!("Failed to create thumbnail cache directory: {}", e);
                return;
            }

            // 写入缓存文件
            if let Err(e) = tokio::fs::write(&cache_path_clone, &thumbnail_clone).await {
                tracing::warn!("Failed to write thumbnail cache: {}", e);
            } else {
                tracing::debug!("Thumbnail cached: {}", cache_path_clone.display());
            }
        });

        Ok(thumbnail)
    }

    /// 扫描文件夹中的所有图片（异步版本）
    ///
    /// 使用 tokio::fs 进行异步文件系统操作，避免阻塞运行时
    async fn scan_images_in_folder(&self, folder_path: &str) -> anyhow::Result<Vec<String>> {
        // 从配置中获取支持的图片格式
        let supported_formats = shared::config::get().server().image().supported_formats();
        let folder_path = folder_path.to_string();

        // 在线程池中执行文件扫描（因为 read_dir 是同步的）
        let images = tokio::task::spawn_blocking(move || {
            let mut images = Vec::new();

            if let Ok(entries) = std::fs::read_dir(&folder_path) {
                let mut entries: Vec<_> = entries
                    .flatten()
                    .filter_map(|entry| {
                        let path = entry.path();
                        if path.is_file() {
                            if let Some(ext) = path.extension() {
                                if let Some(ext_str) = ext.to_str() {
                                    if supported_formats.contains(&ext_str.to_lowercase().as_str()) {
                                        return Some((path, entry.file_name()));
                                    }
                                }
                            }
                        }
                        None
                    })
                    .collect();

                // 使用自然排序（Natural Sort）按文件名排序
                // 这样 1.jpg < 2.jpg < 10.jpg，而不是 1.jpg < 10.jpg < 2.jpg
                entries.sort_by(|a, b| natord::compare(&a.1.to_string_lossy(), &b.1.to_string_lossy()));

                images = entries.into_iter()
                    .map(|(path, _)| path.to_string_lossy().to_string())
                    .collect();
            }

            images
        })
        .await
        .map_err(|e| anyhow::anyhow!("Task join error: {}", e))?;

        Ok(images)
    }

    // ==================== 章节图片相关方法 ====================

    /// 从缓存或数据库获取章节信息
    async fn get_chapter_from_cache_or_db(&self, chapter_id: i32) -> anyhow::Result<Arc<domain::entity::manga_chapter::Model>> {
        // 先尝试从缓存获取
        if let Some(cached_chapter) = self.chapter_cache.get(&chapter_id).await {
            tracing::debug!("Chapter cache hit for chapter_id: {}", chapter_id);
            return Ok(cached_chapter);
        }

        tracing::debug!("Chapter cache miss for chapter_id: {}", chapter_id);

        // 缓存未命中，从数据库获取
        let chapter = self.manga_chapter_repo
            .find_by_id(chapter_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Chapter not found"))?;

        let chapter_arc = Arc::new(chapter);

        // 存入缓存
        self.chapter_cache.insert(chapter_id, chapter_arc.clone()).await;

        Ok(chapter_arc)
    }

    /// 获取章节的所有图片列表（带缓存）
    pub async fn get_chapter_images(&self, chapter_id: i32) -> anyhow::Result<Vec<String>> {
        // 先尝试从缓存获取
        if let Some(cached_images) = self.chapter_image_list_cache.get(&chapter_id).await {
            tracing::debug!("Chapter image list cache hit for chapter_id: {}", chapter_id);
            return Ok((*cached_images).clone());
        }

        tracing::debug!("Chapter image list cache miss for chapter_id: {}", chapter_id);

        // 缓存未命中，从数据库获取章节信息
        let chapter = self.get_chapter_from_cache_or_db(chapter_id).await?;

        // 异步扫描文件夹获取图片列表
        let images = self.scan_images_in_folder(&chapter.path).await?;

        // 存入缓存
        self.chapter_image_list_cache.insert(chapter_id, Arc::new(images.clone())).await;

        Ok(images)
    }

    /// 获取章节的第 N 张图片的路径（用于流式传输）
    pub async fn get_chapter_image_path(&self, chapter_id: i32, index: i32) -> anyhow::Result<String> {
        let images = self.get_chapter_images(chapter_id).await?;

        if index < 0 || index >= images.len() as i32 {
            return Err(anyhow::anyhow!("Image index out of range"));
        }

        Ok(images[index as usize].clone())
    }

    /// 获取章节的第 N 张图片（完整数据）
    /// 注意：这个方法会将整个文件加载到内存，大文件建议使用 get_chapter_image_path + 流式传输
    pub async fn get_chapter_image(&self, chapter_id: i32, index: i32) -> anyhow::Result<Vec<u8>> {
        let image_path = self.get_chapter_image_path(chapter_id, index).await?;

        // ✅ 使用异步 IO，不阻塞运行时
        tokio::fs::read(&image_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read image: {}", e))
    }

    /// 获取章节的封面路径（用于流式传输，带缓存）
    ///
    /// 如果 cover 字段是 API 路径格式（如 `/manga/1/chapter/1/cover`），则获取章节文件夹中的第一张图片
    /// 否则直接使用 cover 字段作为文件系统路径
    pub async fn get_chapter_cover_path(&self, chapter_id: i32) -> anyhow::Result<String> {
        // 从缓存或数据库获取章节信息
        let chapter = self.get_chapter_from_cache_or_db(chapter_id).await?;

        // 如果 cover 是 API 路径格式（以 / 开头），则获取第一张图片
        if let Some(cover) = &chapter.cover {
            if cover.starts_with("/manga/") || cover.starts_with("/api/manga/") {
                // 这是 API 路径格式，使用缓存的图片列表获取第一张图片
                let images = self.get_chapter_images(chapter_id).await?;
                return images.first()
                    .cloned()
                    .ok_or_else(|| anyhow::anyhow!("No images found in chapter folder"));
            } else {
                // 这是真实的文件系统路径
                return Ok(cover.clone());
            }
        }

        // 如果没有 cover 字段，使用缓存的图片列表获取第一张图片
        let images = self.get_chapter_images(chapter_id).await?;
        images.first()
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("No images found in chapter folder"))
    }

    /// 获取章节的封面（完整数据）
    /// 注意：这个方法会将整个文件加载到内存，大文件建议使用 get_chapter_cover_path + 流式传输
    pub async fn get_chapter_cover(&self, chapter_id: i32) -> anyhow::Result<Vec<u8>> {
        let cover_path = self.get_chapter_cover_path(chapter_id).await?;

        // ✅ 使用异步 IO，不阻塞运行时
        tokio::fs::read(&cover_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read cover: {}", e))
    }

    /// 获取章节的封面缩略图（带缓存）
    ///
    /// # 参数
    /// - `chapter_id`: 章节 ID
    /// - `width`: 缩略图宽度（像素），默认 200
    /// - `height`: 缩略图高度（像素），默认 300
    /// - `quality`: 图片质量（0-100），默认 85
    ///
    /// # 返回
    /// - `Vec<u8>` - JPEG 格式的缩略图数据
    pub async fn get_chapter_cover_thumbnail(
        &self,
        chapter_id: i32,
        width: Option<u32>,
        height: Option<u32>,
        quality: Option<u8>,
    ) -> anyhow::Result<Vec<u8>> {
        let width = width.unwrap_or(200);
        let height = height.unwrap_or(300);
        let quality = quality.unwrap_or(85);

        // 获取封面路径
        let cover_path = self.get_chapter_cover_path(chapter_id).await?;

        // 读取原始图片
        let image_data = tokio::fs::read(&cover_path).await
            .map_err(|e| anyhow::anyhow!("Failed to read cover: {}", e))?;

        // 压缩为缩略图
        compress_image(&image_data, width, height, quality)
    }
}

/// 压缩图片为缩略图
///
/// # 参数
/// - `image_data`: 原始图片数据
/// - `width`: 缩略图宽度（像素）
/// - `height`: 缩略图高度（像素）
/// - `quality`: 图片质量（0-100）
fn compress_image(image_data: &[u8], width: u32, height: u32, _quality: u8) -> anyhow::Result<Vec<u8>> {
    use std::io::Cursor;

    // 读取图片
    let img = image::io::Reader::new(Cursor::new(image_data))
        .with_guessed_format()
        .map_err(|e| anyhow::anyhow!("Failed to read image: {}", e))?
        .decode()
        .map_err(|e| anyhow::anyhow!("Failed to decode image: {}", e))?;

    // 按比例缩放（保持宽高比）
    let thumbnail = img.thumbnail(width, height);

    // 压缩为 JPEG
    let mut compressed = Vec::new();
    thumbnail.write_to(&mut Cursor::new(&mut compressed), image::ImageFormat::Jpeg)
        .map_err(|e| anyhow::anyhow!("Failed to compress image: {}", e))?;

    Ok(compressed)
}