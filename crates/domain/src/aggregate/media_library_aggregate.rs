use crate::entity::game;
use crate::entity::manga;
use crate::entity::manga_chapter;
use crate::entity::media_library;
use crate::entity::movie;
use crate::entity::photo;
use crate::entity::photo_exif;
use crate::service::MangaDomainService;

/// MediaLibrary 聚合根
///
/// # DDD 设计
/// - ✅ 聚合根：MediaLibrary 是聚合根，管理其下的所有媒体实体（Manga、Game、Movie 等）
/// - ✅ 一致性边界：所有对媒体实体的创建和更新都通过聚合根进行
/// - ✅ 业务规则：聚合根保证业务规则的一致性
///
/// # 职责
/// - 管理 MediaLibrary 实体的生命周期
/// - 管理 Manga、Game、Movie、Photo 等媒体实体的创建和更新
/// - 保证 MediaLibrary 和媒体实体之间的一致性
/// - 封装业务规则
pub struct MediaLibraryAggregate {
    /// 媒体库实体（聚合根）
    pub media_library: media_library::Model,
    /// 漫画实体列表（聚合内的实体）
    pub mangas: Vec<manga::Model>,
    /// 漫画章节列表（聚合内的实体）
    pub manga_chapters: Vec<manga_chapter::Model>,
    /// 游戏实体列表（聚合内的实体）
    pub games: Vec<game::Model>,
    /// 电影实体列表（聚合内的实体）
    pub movies: Vec<movie::Model>,
    /// 照片实体列表（聚合内的实体）
    pub photos: Vec<photo::Model>,
    /// 照片 EXIF 信息列表（聚合内的实体）
    pub photo_exifs: Vec<photo_exif::Model>,
}

impl MediaLibraryAggregate {
    /// 创建新的媒体库聚合根
    /// 
    /// # 参数
    /// - `title`: 媒体库标题
    /// - `paths_json`: 路径 JSON
    /// - `source`: 来源
    /// - `media_type`: 媒体类型
    /// 
    /// # 返回
    /// - `anyhow::Result<Self>` - 创建的聚合根
    /// 
    /// # 业务规则
    /// - 标题不能为空，长度不超过 100 个字符
    /// - 路径 JSON 必须是有效的 JSON 数组
    /// - 媒体类型必须是有效的类型
    pub fn new(
        title: String,
        paths_json: String,
        source: String,
        media_type: String,
    ) -> anyhow::Result<Self> {
        // 创建媒体库实体（使用工厂方法，自动验证业务规则）
        let media_library = media_library::Model::new(
            title,
            paths_json,
            source,
            media_type,
            0, // 初始项目数量为 0
        )?;

        Ok(Self {
            media_library,
            mangas: Vec::new(),
            manga_chapters: Vec::new(),
            games: Vec::new(),
            movies: Vec::new(),
            photos: Vec::new(),
            photo_exifs: Vec::new(),
        })
    }

    /// 从现有的媒体库实体创建聚合根
    ///
    /// # 参数
    /// - `media_library`: 媒体库实体
    /// - `mangas`: 漫画实体列表
    /// - `manga_chapters`: 漫画章节列表
    /// - `games`: 游戏实体列表
    /// - `movies`: 电影实体列表
    /// - `photos`: 照片实体列表
    /// - `photo_exifs`: 照片 EXIF 信息列表
    ///
    /// # 返回
    /// - `Self` - 创建的聚合根
    pub fn from_entities(
        media_library: media_library::Model,
        mangas: Vec<manga::Model>,
        manga_chapters: Vec<manga_chapter::Model>,
        games: Vec<game::Model>,
        movies: Vec<movie::Model>,
        photos: Vec<photo::Model>,
        photo_exifs: Vec<photo_exif::Model>,
    ) -> Self {
        Self {
            media_library,
            mangas,
            manga_chapters,
            games,
            movies,
            photos,
            photo_exifs,
        }
    }

    /// 添加漫画到聚合根
    /// 
    /// # 参数
    /// - `folder_path`: 漫画文件夹路径
    /// - `page_count`: 页数
    /// - `byte_size`: 字节大小
    /// 
    /// # 返回
    /// - `anyhow::Result<&manga::Model>` - 添加的漫画实体引用
    /// 
    /// # 业务规则
    /// - 漫画必须属于当前媒体库
    /// - 漫画路径不能重复
    /// - 自动更新媒体库的项目数量
    pub fn add_manga(
        &mut self,
        folder_path: String,
        page_count: i32,
        byte_size: i32,
    ) -> anyhow::Result<&manga::Model> {
        // 检查路径是否重复
        if self.mangas.iter().any(|m| m.path == folder_path) {
            return Err(anyhow::anyhow!("Manga with path '{}' already exists", folder_path));
        }

        // 使用领域服务提取标题
        let title = MangaDomainService::extract_title_from_path(&folder_path);

        // 创建漫画实体（使用工厂方法，自动验证业务规则）
        let manga = manga::Model::new(
            title,
            folder_path,
            page_count,
            byte_size,
            "漫画".to_string(), // 默认类型为"漫画"
            self.media_library.id,
            false, // 单文件夹漫画，无章节结构
        )?;

        // 添加到聚合根
        self.mangas.push(manga);

        // 更新媒体库的项目数量
        self.media_library.increment_item_count(1)?;

        // 返回最后添加的漫画引用
        Ok(self.mangas.last().unwrap())
    }

    /// 批量添加漫画到聚合根
    /// 
    /// # 参数
    /// - `manga_folders_data`: 漫画文件夹数据列表 (folder_path, page_count, byte_size)
    /// 
    /// # 返回
    /// - `anyhow::Result<usize>` - 成功添加的漫画数量
    /// 
    /// # 业务规则
    /// - 所有漫画必须属于当前媒体库
    /// - 漫画路径不能重复
    /// - 自动更新媒体库的项目数量
    pub fn add_mangas_batch(
        &mut self,
        manga_folders_data: Vec<(String, i32, i32)>,
    ) -> anyhow::Result<usize> {
        let mut added_count = 0;

        for (folder_path, page_count, byte_size) in manga_folders_data {
            // 检查路径是否重复
            if self.mangas.iter().any(|m| m.path == folder_path) {
                tracing::warn!("Skipping duplicate manga path: {}", folder_path);
                continue;
            }

            // 使用领域服务提取标题
            let title = MangaDomainService::extract_title_from_path(&folder_path);
            tracing::debug!("Extracted title from path '{}': '{}' (length: {})", folder_path, title, title.len());

            // 创建漫画实体（使用工厂方法，自动验证业务规则）
            match manga::Model::new(
                title,
                folder_path.clone(),
                page_count,
                byte_size,
                "漫画".to_string(), // 默认类型为"漫画"
                self.media_library.id,
                false, // 单文件夹漫画，无章节结构
            ) {
                Ok(manga) => {
                    self.mangas.push(manga);
                    added_count += 1;
                }
                Err(e) => {
                    tracing::warn!("Failed to create manga for path {}: {}", folder_path, e);
                }
            }
        }

        // 更新媒体库的项目数量
        if added_count > 0 {
            self.media_library.increment_item_count(added_count as i32)?;
        }

        Ok(added_count)
    }

    /// 移除漫画从聚合根
    /// 
    /// # 参数
    /// - `manga_id`: 漫画 ID
    /// 
    /// # 返回
    /// - `anyhow::Result<manga::Model>` - 移除的漫画实体
    /// 
    /// # 业务规则
    /// - 漫画必须属于当前媒体库
    /// - 自动更新媒体库的项目数量
    pub fn remove_manga(&mut self, manga_id: i32) -> anyhow::Result<manga::Model> {
        // 查找漫画索引
        let index = self.mangas.iter().position(|m| m.id == manga_id)
            .ok_or_else(|| anyhow::anyhow!("Manga with id {} not found", manga_id))?;

        // 移除漫画
        let manga = self.mangas.remove(index);

        // 更新媒体库的项目数量
        self.media_library.decrement_item_count(1)?;

        Ok(manga)
    }

    /// 添加带章节的漫画到聚合根
    ///
    /// # 参数
    /// - `root_path`: 漫画根目录路径
    /// - `chapters`: 章节信息列表 (path, title, chapter_number, page_count)
    ///
    /// # 返回
    /// - `anyhow::Result<(manga::Model, Vec<manga_chapter::Model>)>` - 创建的漫画和章节实体
    ///
    /// # 业务规则
    /// - 漫画必须至少有 1 个章节
    /// - 章节号必须唯一
    /// - 自动更新媒体库的项目数量（+1）
    pub fn add_manga_with_chapters(
        &mut self,
        root_path: String,
        chapters: Vec<(String, String, f32, i32)>, // (path, title, chapter_number, page_count)
    ) -> anyhow::Result<(manga::Model, Vec<manga_chapter::Model>)> {
        // 验证章节数量
        if chapters.is_empty() {
            return Err(anyhow::anyhow!("Manga must have at least 1 chapter"));
        }

        // 使用领域服务提取标题
        let title = MangaDomainService::extract_title_from_path(&root_path);
        tracing::debug!("Extracted title from root_path '{}': '{}' (length: {})", root_path, title, title.len());

        // 计算总页数和总字节大小
        let total_page_count: i32 = chapters.iter().map(|(_, _, _, page_count)| page_count).sum();
        let total_byte_size: i32 = chapters.iter()
            .map(|(path, _, _, _)| MangaDomainService::calculate_folder_byte_size(path))
            .sum();

        // 创建漫画实体（has_chapters = true）
        let manga = manga::Model::new(
            title,
            root_path,
            total_page_count,
            total_byte_size,
            "漫画".to_string(), // 默认类型为"漫画"
            self.media_library.id,
            true, // 章节结构漫画
        )?;

        // 创建章节实体（注意：manga_id 暂时为 0，需要在持久化后更新）
        let chapter_models: Vec<manga_chapter::Model> = chapters
            .into_iter()
            .map(|(path, title, chapter_number, page_count)| {
                let byte_size = MangaDomainService::calculate_folder_byte_size(&path);
                manga_chapter::Model::new(
                    0, // manga_id 暂时为 0，需要在持久化后更新
                    chapter_number,
                    title,
                    path,
                    page_count,
                    byte_size,
                )
            })
            .collect::<Result<Vec<_>, _>>()?;

        // 添加到聚合根
        self.mangas.push(manga.clone());
        self.manga_chapters.extend(chapter_models.clone());

        // 更新媒体库的项目数量
        self.media_library.increment_item_count(1)?;

        Ok((manga, chapter_models))
    }

    /// 更新媒体库标题
    /// 
    /// # 参数
    /// - `new_title`: 新标题
    /// 
    /// # 业务规则
    /// - 标题不能为空，长度不超过 100 个字符
    pub fn update_title(&mut self, new_title: String) -> anyhow::Result<()> {
        self.media_library.update_title(new_title)
    }

    /// 更新媒体库路径
    /// 
    /// # 参数
    /// - `new_paths_json`: 新路径 JSON
    /// 
    /// # 业务规则
    /// - 路径 JSON 必须是有效的 JSON 数组
    pub fn update_paths(&mut self, new_paths_json: String) -> anyhow::Result<()> {
        self.media_library.update_paths(new_paths_json)
    }

    /// 更新最后扫描时间
    pub fn update_last_scanned(&mut self) {
        self.media_library.update_last_scanned();
    }

    /// 设置媒体库封面
    /// 
    /// # 参数
    /// - `cover_url`: 封面 URL
    pub fn set_cover(&mut self, cover_url: String) {
        self.media_library.set_cover(cover_url);
    }

    /// 获取媒体库 ID
    pub fn id(&self) -> i32 {
        self.media_library.id
    }

    /// 获取漫画数量
    pub fn manga_count(&self) -> usize {
        self.mangas.len()
    }

    /// 判断是否支持扫描
    pub fn is_scannable(&self) -> bool {
        self.media_library.is_scannable()
    }

    /// 获取路径列表
    pub fn get_paths(&self) -> anyhow::Result<Vec<String>> {
        self.media_library.get_paths()
    }

    // ============================================================================
    // Game 相关方法
    // ============================================================================

    /// 添加游戏到聚合根
    ///
    /// # 参数
    /// - `title`: 游戏标题
    /// - `root_path`: 游戏根目录
    /// - `start_paths`: 启动路径列表（JSON 数组字符串）
    /// - `release_date`: 发行日期
    ///
    /// # 返回
    /// - `anyhow::Result<&game::Model>` - 添加的游戏实体引用
    ///
    /// # 业务规则
    /// - 游戏必须属于当前媒体库
    /// - 游戏根目录不能重复
    /// - 自动更新媒体库的项目数量
    pub fn add_game(
        &mut self,
        title: String,
        root_path: String,
        start_paths: String,
        release_date: String,
    ) -> anyhow::Result<&game::Model> {
        // 检查根目录是否重复
        if self.games.iter().any(|g| g.root_path == root_path) {
            return Err(anyhow::anyhow!("Game with root path '{}' already exists", root_path));
        }

        // 创建游戏实体（使用工厂方法，自动验证业务规则）
        let game = game::Model::new(
            title,
            root_path,
            start_paths,
            release_date,
            self.media_library.id,
        )?;

        // 添加到聚合根
        self.games.push(game);

        // 更新媒体库的项目数量
        self.media_library.increment_item_count(1)?;

        // 返回最后添加的游戏引用
        Ok(self.games.last().unwrap())
    }

    /// 批量添加游戏到聚合根（从 gamebox::GameInfo 转换，保留完整元数据）
    ///
    /// # 参数
    /// - `game_infos`: gamebox 扫描返回的游戏信息列表
    ///
    /// # 返回
    /// - `anyhow::Result<usize>` - 成功添加的游戏数量
    ///
    /// # 业务规则
    /// - 所有游戏必须属于当前媒体库
    /// - 游戏根目录不能重复
    /// - 自动更新媒体库的项目数量
    /// - ✅ 保留所有元数据（封面、描述、开发商、发行商、标签等）
    #[cfg(feature = "gamebox")]
    pub fn add_games_from_game_info_batch(
        &mut self,
        game_infos: Vec<gamebox::models::game_info::GameInfo>,
    ) -> anyhow::Result<usize> {
        let mut added_count = 0;

        for game_info in game_infos {
            let root_path = game_info.dir_path.to_string_lossy().to_string();

            // 检查根目录是否重复
            if self.games.iter().any(|g| g.root_path == root_path) {
                tracing::warn!("Skipping duplicate game root path: {}", root_path);
                continue;
            }

            // 使用 from_game_info 转换（保留所有元数据）
            match game::Model::from_game_info(game_info, self.media_library.id) {
                Ok(mut game) => {
                    // 确保 media_library_id 正确
                    game.media_library_id = self.media_library.id;
                    self.games.push(game);
                    added_count += 1;
                }
                Err(e) => {
                    tracing::warn!("Failed to create game from GameInfo for path {}: {}", root_path, e);
                }
            }
        }

        // 更新媒体库的项目数量
        if added_count > 0 {
            self.media_library.increment_item_count(added_count as i32)?;
        }

        Ok(added_count)
    }

    /// 移除游戏从聚合根
    ///
    /// # 参数
    /// - `game_id`: 游戏 ID
    ///
    /// # 返回
    /// - `anyhow::Result<game::Model>` - 移除的游戏实体
    ///
    /// # 业务规则
    /// - 游戏必须属于当前媒体库
    /// - 自动更新媒体库的项目数量
    pub fn remove_game(&mut self, game_id: i32) -> anyhow::Result<game::Model> {
        // 查找游戏索引
        let index = self.games.iter().position(|g| g.id == game_id)
            .ok_or_else(|| anyhow::anyhow!("Game with id {} not found", game_id))?;

        // 移除游戏
        let game = self.games.remove(index);

        // 更新媒体库的项目数量
        self.media_library.decrement_item_count(1)?;

        Ok(game)
    }

    /// 获取游戏数量
    pub fn game_count(&self) -> usize {
        self.games.len()
    }

    /// 添加电影到聚合根
    ///
    /// # 参数
    /// - `title`: 电影标题
    /// - `path`: 视频文件路径
    ///
    /// # 返回
    /// - `anyhow::Result<&movie::Model>` - 添加的电影实体引用
    ///
    /// # 业务规则
    /// - 电影必须属于当前媒体库
    /// - 电影路径不能重复
    /// - 自动更新媒体库的项目数量
    pub fn add_movie(
        &mut self,
        title: String,
        path: String,
    ) -> anyhow::Result<&movie::Model> {
        // 检查路径是否重复
        if self.movies.iter().any(|m| m.path == path) {
            return Err(anyhow::anyhow!("Movie with path '{}' already exists", path));
        }

        // 创建电影实体
        let movie = movie::Model::new(title, path, self.media_library.id);

        // 添加到聚合根
        self.movies.push(movie);

        // 更新媒体库的项目数量
        self.media_library.increment_item_count(1)?;

        // 返回最后添加的电影引用
        Ok(self.movies.last().unwrap())
    }

    /// 批量添加电影到聚合根
    ///
    /// # 参数
    /// - `movies`: 电影实体列表
    ///
    /// # 返回
    /// - `anyhow::Result<usize>` - 成功添加的电影数量
    ///
    /// # 业务规则
    /// - 所有电影必须属于当前媒体库
    /// - 电影路径不能重复
    /// - 自动更新媒体库的项目数量
    pub fn add_movies_batch(
        &mut self,
        mut movies: Vec<movie::Model>,
    ) -> anyhow::Result<usize> {
        let mut added_count = 0;

        for movie in &mut movies {
            let path = movie.path.clone();

            // 检查路径是否重复
            if self.movies.iter().any(|m| m.path == path) {
                tracing::warn!("Skipping duplicate movie path: {}", path);
                continue;
            }

            // 确保 media_library_id 正确
            movie.media_library_id = self.media_library.id;
            self.movies.push(movie.clone());
            added_count += 1;
        }

        // 更新媒体库的项目数量
        if added_count > 0 {
            self.media_library.increment_item_count(added_count as i32)?;
        }

        Ok(added_count)
    }

    /// 移除电影从聚合根
    ///
    /// # 参数
    /// - `movie_id`: 电影 ID
    ///
    /// # 返回
    /// - `anyhow::Result<movie::Model>` - 移除的电影实体
    ///
    /// # 业务规则
    /// - 电影必须属于当前媒体库
    /// - 自动更新媒体库的项目数量
    pub fn remove_movie(&mut self, movie_id: i32) -> anyhow::Result<movie::Model> {
        // 查找电影索引
        let index = self.movies.iter().position(|m| m.id == movie_id)
            .ok_or_else(|| anyhow::anyhow!("Movie with id {} not found", movie_id))?;

        // 移除电影
        let movie = self.movies.remove(index);

        // 更新媒体库的项目数量
        self.media_library.decrement_item_count(1)?;

        Ok(movie)
    }

    /// 获取电影数量
    pub fn movie_count(&self) -> usize {
        self.movies.len()
    }

    /// 获取总媒体项数量（漫画 + 游戏 + 电影 + 照片）
    pub fn total_media_count(&self) -> usize {
        self.mangas.len() + self.games.len() + self.movies.len() + self.photos.len()
    }

    // ============================================================================
    // Photo 相关方法
    // ============================================================================

    /// 批量添加照片到聚合根
    ///
    /// # 参数
    /// - `photos`: 照片实体列表
    /// - `photo_exifs`: 照片 EXIF 信息列表
    ///
    /// # 返回
    /// - `anyhow::Result<usize>` - 添加的照片数量
    ///
    /// # 业务规则
    /// - 照片路径不能重复
    /// - 自动设置 media_library_id
    /// - 自动更新媒体库的项目数量
    pub fn add_photos_batch(
        &mut self,
        mut photos: Vec<photo::Model>,
        photo_exifs: Vec<photo_exif::Model>,
    ) -> anyhow::Result<usize> {
        let mut added_count = 0;

        for photo in &mut photos {
            let path = photo.path.clone();

            // 检查路径是否重复
            if self.photos.iter().any(|p| p.path == path) {
                tracing::warn!("Skipping duplicate photo path: {}", path);
                continue;
            }

            // 确保 media_library_id 正确
            photo.media_library_id = self.media_library.id;
            self.photos.push(photo.clone());
            added_count += 1;
        }

        // 添加 EXIF 信息
        self.photo_exifs.extend(photo_exifs);

        // 更新媒体库的项目数量
        if added_count > 0 {
            self.media_library.increment_item_count(added_count as i32)?;
        }

        Ok(added_count)
    }

    /// 移除照片从聚合根
    ///
    /// # 参数
    /// - `photo_id`: 照片 ID
    ///
    /// # 返回
    /// - `anyhow::Result<photo::Model>` - 移除的照片实体
    ///
    /// # 业务规则
    /// - 照片必须属于当前媒体库
    /// - 自动更新媒体库的项目数量
    pub fn remove_photo(&mut self, photo_id: i32) -> anyhow::Result<photo::Model> {
        // 查找照片索引
        let index = self.photos.iter().position(|p| p.id == photo_id)
            .ok_or_else(|| anyhow::anyhow!("Photo with id {} not found", photo_id))?;

        // 移除照片
        let photo = self.photos.remove(index);

        // 移除对应的 EXIF 信息
        if let Some(exif_index) = self.photo_exifs.iter().position(|e| e.photo_id == photo_id) {
            self.photo_exifs.remove(exif_index);
        }

        // 更新媒体库的项目数量
        self.media_library.decrement_item_count(1)?;

        Ok(photo)
    }

    /// 获取照片数量
    pub fn photo_count(&self) -> usize {
        self.photos.len()
    }
}