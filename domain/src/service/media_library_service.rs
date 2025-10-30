/// 媒体库领域服务
/// 
/// 职责：
/// - 封装媒体库相关的业务规则和验证逻辑
/// - 提供领域层的业务操作
/// - 不依赖任何基础设施层的实现
pub struct MediaLibraryDomainService;

impl MediaLibraryDomainService {
    /// 验证媒体库标题
    /// 
    /// 业务规则：
    /// - 标题不能为空
    /// - 标题长度不能超过 100 个字符
    pub fn validate_title(title: &str) -> anyhow::Result<()> {
        if title.is_empty() {
            return Err(anyhow::anyhow!("Media library title is required"));
        }
        if title.len() > 100 {
            return Err(anyhow::anyhow!("Media library title too long (max 100 characters)"));
        }
        Ok(())
    }

    /// 验证媒体库路径
    /// 
    /// 业务规则：
    /// - 路径 JSON 不能为空
    /// - 路径 JSON 必须是有效的 JSON 数组
    pub fn validate_paths_json(paths_json: &str) -> anyhow::Result<()> {
        if paths_json.is_empty() {
            return Err(anyhow::anyhow!("Paths JSON is required"));
        }

        // 验证是否是有效的 JSON 数组
        let paths: Result<Vec<String>, _> = serde_json::from_str(paths_json);
        if paths.is_err() {
            return Err(anyhow::anyhow!("Invalid paths JSON format"));
        }

        // 验证至少有一个路径
        let paths = paths.unwrap();
        if paths.is_empty() {
            return Err(anyhow::anyhow!("At least one path is required"));
        }

        Ok(())
    }

    /// 验证媒体类型
    ///
    /// 业务规则：
    /// - 媒体类型必须是有效的类型
    pub fn validate_media_type(media_type: &str) -> anyhow::Result<()> {
        let valid_types = vec![
            "电影", "视频", "音乐", "电视节目", "有声读物", "书籍",
            "游戏", "漫画", "音乐视频", "照片", "混合内容"
        ];
        if !valid_types.contains(&media_type) {
            return Err(anyhow::anyhow!(
                "Invalid media type: {}. Valid types: {:?}",
                media_type,
                valid_types
            ));
        }
        Ok(())
    }

    /// 验证项目数量
    /// 
    /// 业务规则：
    /// - 项目数量必须大于等于 0
    pub fn validate_item_count(item_count: i32) -> anyhow::Result<()> {
        if item_count < 0 {
            return Err(anyhow::anyhow!("Item count must be non-negative"));
        }
        Ok(())
    }

    /// 解析路径 JSON
    /// 
    /// # 参数
    /// - `paths_json`: JSON 格式的路径数组
    /// 
    /// # 返回
    /// - Vec<String> - 路径列表
    pub fn parse_paths_json(paths_json: &str) -> anyhow::Result<Vec<String>> {
        Self::validate_paths_json(paths_json)?;
        
        let paths: Vec<String> = serde_json::from_str(paths_json)
            .map_err(|e| anyhow::anyhow!("Failed to parse paths JSON: {}", e))?;
        
        Ok(paths)
    }

    /// 判断媒体类型是否支持扫描
    ///
    /// 业务规则：
    /// - "漫画" 类型支持扫描（扫描图片文件夹）
    /// - "游戏" 类型支持扫描（使用 gamebox 库扫描游戏）
    pub fn is_scannable_media_type(media_type: &str) -> bool {
        matches!(media_type, "漫画" | "游戏")
    }

    /// 生成媒体库封面 URL
    /// 
    /// 业务规则：
    /// - 如果媒体库有项目，使用第一个项目的封面
    /// - 如果没有项目，返回 None
    pub fn generate_cover_url(media_library_id: i32, has_items: bool) -> Option<String> {
        if has_items {
            Some(format!("/api/media-library/{}/cover", media_library_id))
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_title() {
        // 正常标题
        assert!(MediaLibraryDomainService::validate_title("My Library").is_ok());

        // 空标题
        assert!(MediaLibraryDomainService::validate_title("").is_err());

        // 超长标题
        let long_title = "a".repeat(101);
        assert!(MediaLibraryDomainService::validate_title(&long_title).is_err());
    }

    #[test]
    fn test_validate_paths_json() {
        // 正常路径
        let valid_json = r#"["/path/to/manga"]"#;
        assert!(MediaLibraryDomainService::validate_paths_json(valid_json).is_ok());

        // 空字符串
        assert!(MediaLibraryDomainService::validate_paths_json("").is_err());

        // 无效 JSON
        assert!(MediaLibraryDomainService::validate_paths_json("invalid json").is_err());

        // 空数组
        assert!(MediaLibraryDomainService::validate_paths_json("[]").is_err());
    }

    #[test]
    fn test_validate_media_type() {
        // 有效类型
        assert!(MediaLibraryDomainService::validate_media_type("漫画").is_ok());
        assert!(MediaLibraryDomainService::validate_media_type("游戏").is_ok());
        assert!(MediaLibraryDomainService::validate_media_type("音乐").is_ok());
        assert!(MediaLibraryDomainService::validate_media_type("电影").is_ok());
        assert!(MediaLibraryDomainService::validate_media_type("视频").is_ok());

        // 无效类型
        assert!(MediaLibraryDomainService::validate_media_type("invalid").is_err());
    }

    #[test]
    fn test_parse_paths_json() {
        let json = r#"["/path/1", "/path/2"]"#;
        let paths = MediaLibraryDomainService::parse_paths_json(json).unwrap();
        assert_eq!(paths.len(), 2);
        assert_eq!(paths[0], "/path/1");
        assert_eq!(paths[1], "/path/2");
    }

    #[test]
    fn test_is_scannable_media_type() {
        // 支持扫描的类型
        assert!(MediaLibraryDomainService::is_scannable_media_type("漫画"));
        assert!(MediaLibraryDomainService::is_scannable_media_type("游戏"));

        // 不支持扫描的类型
        assert!(!MediaLibraryDomainService::is_scannable_media_type("音乐"));
        assert!(!MediaLibraryDomainService::is_scannable_media_type("电视节目"));
        assert!(!MediaLibraryDomainService::is_scannable_media_type("电影"));
    }

    #[test]
    fn test_generate_cover_url() {
        let url = MediaLibraryDomainService::generate_cover_url(1, true);
        assert_eq!(url, Some("/api/media-library/1/cover".to_string()));

        let url_no_items = MediaLibraryDomainService::generate_cover_url(1, false);
        assert_eq!(url_no_items, None);
    }
}

