/// 漫画领域服务
/// 
/// 职责：
/// - 封装漫画相关的业务规则和验证逻辑
/// - 提供领域层的业务操作
/// - 不依赖任何基础设施层的实现
pub struct MangaDomainService;

impl MangaDomainService {
    /// 验证漫画标题
    /// 
    /// 业务规则：
    /// - 标题不能为空
    /// - 标题长度不能超过 200 个字符
    pub fn validate_title(title: &str) -> anyhow::Result<()> {
        if title.is_empty() {
            return Err(anyhow::anyhow!("Title is required"));
        }
        if title.len() > 200 {
            return Err(anyhow::anyhow!("Title too long (max 200 characters)"));
        }
        Ok(())
    }

    /// 验证漫画路径
    /// 
    /// 业务规则：
    /// - 路径不能为空
    /// - 路径必须存在
    pub fn validate_path(path: &str) -> anyhow::Result<()> {
        if path.is_empty() {
            return Err(anyhow::anyhow!("Path is required"));
        }
        if !std::path::Path::new(path).exists() {
            return Err(anyhow::anyhow!("Path does not exist: {}", path));
        }
        Ok(())
    }

    /// 验证页数
    /// 
    /// 业务规则：
    /// - 页数必须大于等于 0
    pub fn validate_page_count(page_count: i32) -> anyhow::Result<()> {
        if page_count < 0 {
            return Err(anyhow::anyhow!("Page count must be non-negative"));
        }
        Ok(())
    }

    /// 验证字节大小
    /// 
    /// 业务规则：
    /// - 字节大小必须大于等于 0
    pub fn validate_byte_size(byte_size: i32) -> anyhow::Result<()> {
        if byte_size < 0 {
            return Err(anyhow::anyhow!("Byte size must be non-negative"));
        }
        Ok(())
    }

    /// 过滤有效的漫画文件夹
    /// 
    /// 业务规则：
    /// - 文件夹中必须有 2 张或以上的图片才算有效的漫画
    /// 
    /// # 参数
    /// - `folders`: Vec<(文件夹路径, 图片数量)>
    /// 
    /// # 返回
    /// - Vec<(文件夹路径, 图片数量)> - 过滤后的有效漫画文件夹
    pub fn filter_valid_manga_folders(folders: Vec<(String, i32)>) -> Vec<(String, i32)> {
        folders
            .into_iter()
            .filter(|(_, count)| *count >= 2)
            .collect()
    }

    /// 从文件夹路径提取漫画标题
    ///
    /// 业务规则：
    /// - 移除所有中括号及其内容（作者、翻译组等标记）
    /// - 例如：[紅玉] 便器姫子-無文字、落書差分 -> 便器姫子-無文字、落書差分
    /// - 例如：[Simao] 先輩のお誘い -> 先輩のお誘い
    /// - 例如：[超勇汉化组] [むりぽよ] 标题 [中国翻译] -> 标题
    /// - 如果提取后的标题为空，使用整个文件夹名称
    /// - 如果标题超过 200 个字符，截断到 197 个字符并添加 "..."
    /// - 如果无法提取，返回 "Unknown"
    ///
    /// # 参数
    /// - `path`: 文件夹路径
    ///
    /// # 返回
    /// - String - 提取的标题
    pub fn extract_title_from_path(path: &str) -> String {
        let folder_name = std::path::Path::new(path)
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown");

        // 移除所有中括号及其内容
        let mut title = String::new();
        let mut in_bracket = false;

        for ch in folder_name.chars() {
            match ch {
                '[' => in_bracket = true,
                ']' => in_bracket = false,
                _ => {
                    if !in_bracket {
                        title.push(ch);
                    }
                }
            }
        }

        // 去除两端空格
        let title = title.trim();

        // 如果提取后的标题为空，使用整个文件夹名称
        let final_title = if title.is_empty() {
            folder_name
        } else {
            title
        };

        // 如果标题超过 200 个字符，截断到 197 个字符并添加 "..."
        if final_title.len() > 200 {
            let truncated = final_title.chars().take(197).collect::<String>();
            format!("{}...", truncated)
        } else {
            final_title.to_string()
        }
    }

    /// 计算图片列表的总字节大小
    ///
    /// # 参数
    /// - `image_paths`: 图片路径列表
    ///
    /// # 返回
    /// - i32 - 总字节大小
    pub fn calculate_total_byte_size(image_paths: &[String]) -> i32 {
        image_paths
            .iter()
            .filter_map(|path| std::fs::metadata(path).ok())
            .map(|metadata| metadata.len() as i32)
            .sum()
    }

    /// 计算文件夹的总字节大小
    ///
    /// # 参数
    /// - `folder_path`: 文件夹路径
    ///
    /// # 返回
    /// - i32 - 总字节大小
    pub fn calculate_folder_byte_size(folder_path: &str) -> i32 {
        let mut total_size: u64 = 0;

        if let Ok(entries) = std::fs::read_dir(folder_path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        total_size += metadata.len();
                    }
                }
            }
        }

        // 转换为 i32，如果超过 i32 最大值则返回 i32::MAX
        if total_size > i32::MAX as u64 {
            i32::MAX
        } else {
            total_size as i32
        }
    }

    /// 验证漫画类型
    /// 
    /// 业务规则：
    /// - 漫画类型必须是有效的类型（漫画、轻小说等）
    pub fn validate_manga_type(manga_type: &str) -> anyhow::Result<()> {
        let valid_types = vec!["漫画", "轻小说", "画集", "其他"];
        if !valid_types.contains(&manga_type) {
            return Err(anyhow::anyhow!(
                "Invalid manga type: {}. Valid types: {:?}",
                manga_type,
                valid_types
            ));
        }
        Ok(())
    }
}