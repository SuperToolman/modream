/// 游戏领域服务
/// 
/// 职责：
/// - 封装游戏相关的业务规则和验证逻辑
/// - 提供领域层的业务操作
/// - 不依赖任何基础设施层的实现
pub struct GameDomainService;

impl GameDomainService {
    /// 验证游戏标题
    /// 
    /// 业务规则：
    /// - 标题不能为空
    /// - 标题长度不能超过 200 个字符
    pub fn validate_title(title: &str) -> anyhow::Result<()> {
        if title.is_empty() {
            return Err(anyhow::anyhow!("游戏标题不能为空"));
        }
        if title.len() > 200 {
            return Err(anyhow::anyhow!("游戏标题过长（最多 200 个字符）"));
        }
        Ok(())
    }

    /// 验证游戏根目录路径
    /// 
    /// 业务规则：
    /// - 路径不能为空
    pub fn validate_root_path(path: &str) -> anyhow::Result<()> {
        if path.is_empty() {
            return Err(anyhow::anyhow!("游戏根目录路径不能为空"));
        }
        Ok(())
    }

    /// 验证启动路径列表
    /// 
    /// 业务规则：
    /// - 必须是有效的 JSON 数组格式
    /// - 至少包含一个启动路径
    pub fn validate_start_paths(start_paths: &str) -> anyhow::Result<()> {
        // 验证 JSON 格式
        let paths: Vec<String> = serde_json::from_str(start_paths)
            .map_err(|e| anyhow::anyhow!("启动路径 JSON 格式无效: {}", e))?;
        
        if paths.is_empty() {
            return Err(anyhow::anyhow!("至少需要一个启动路径"));
        }
        
        Ok(())
    }

    /// 验证发行日期
    /// 
    /// 业务规则：
    /// - 必须是有效的日期格式（YYYY-MM-DD HH:MM:SS 或 YYYY-MM-DD）
    pub fn validate_release_date(date: &str) -> anyhow::Result<()> {
        if date.is_empty() {
            return Err(anyhow::anyhow!("发行日期不能为空"));
        }
        
        // 尝试解析日期格式
        let formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%d"];
        let mut valid = false;
        
        for format in &formats {
            if chrono::NaiveDateTime::parse_from_str(date, format).is_ok() 
                || chrono::NaiveDate::parse_from_str(date, format).is_ok() {
                valid = true;
                break;
            }
        }
        
        if !valid {
            return Err(anyhow::anyhow!("发行日期格式无效，应为 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS"));
        }
        
        Ok(())
    }

    /// 验证字节大小
    /// 
    /// 业务规则：
    /// - 字节大小必须大于等于 0
    pub fn validate_byte_size(byte_size: i32) -> anyhow::Result<()> {
        if byte_size < 0 {
            return Err(anyhow::anyhow!("字节大小不能为负数"));
        }
        Ok(())
    }

    /// 验证 JSON 数组格式
    /// 
    /// 业务规则：
    /// - 必须是有效的 JSON 数组格式
    pub fn validate_json_array(json_str: &str) -> anyhow::Result<()> {
        let _: Vec<String> = serde_json::from_str(json_str)
            .map_err(|e| anyhow::anyhow!("JSON 数组格式无效: {}", e))?;
        Ok(())
    }

    /// 解析 JSON 数组
    /// 
    /// # 参数
    /// - `json_str`: JSON 数组字符串
    /// 
    /// # 返回
    /// - `anyhow::Result<Vec<String>>` - 解析后的字符串数组
    pub fn parse_json_array(json_str: &str) -> anyhow::Result<Vec<String>> {
        serde_json::from_str(json_str)
            .map_err(|e| anyhow::anyhow!("解析 JSON 数组失败: {}", e))
    }

    /// 格式化字节大小为人类可读格式
    /// 
    /// # 参数
    /// - `bytes`: 字节数
    /// 
    /// # 返回
    /// - `String` - 格式化后的大小（如 "1.5 GB"）
    pub fn format_byte_size(bytes: i32) -> String {
        const KB: f64 = 1024.0;
        const MB: f64 = KB * 1024.0;
        const GB: f64 = MB * 1024.0;
        const TB: f64 = GB * 1024.0;

        let bytes_f64 = bytes as f64;

        if bytes_f64 >= TB {
            format!("{:.2} TB", bytes_f64 / TB)
        } else if bytes_f64 >= GB {
            format!("{:.2} GB", bytes_f64 / GB)
        } else if bytes_f64 >= MB {
            format!("{:.2} MB", bytes_f64 / MB)
        } else if bytes_f64 >= KB {
            format!("{:.2} KB", bytes_f64 / KB)
        } else {
            format!("{} B", bytes)
        }
    }

    /// 计算游戏文件夹的字节大小
    /// 
    /// # 参数
    /// - `folder_path`: 文件夹路径
    /// 
    /// # 返回
    /// - `i32` - 文件夹总字节大小
    pub fn calculate_folder_byte_size(folder_path: &str) -> i32 {
        use std::fs;
        
        let path = std::path::Path::new(folder_path);
        if !path.exists() || !path.is_dir() {
            return 0;
        }

        let mut total_size: u64 = 0;

        // 递归计算文件夹大小
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        total_size += metadata.len();
                    } else if metadata.is_dir() {
                        // 递归计算子文件夹
                        if let Some(sub_path) = entry.path().to_str() {
                            total_size += Self::calculate_folder_byte_size(sub_path) as u64;
                        }
                    }
                }
            }
        }

        // 转换为 i32，如果超过 i32::MAX 则返回 i32::MAX
        total_size.min(i32::MAX as u64) as i32
    }

    /// 从游戏文件夹中提取启动文件
    /// 
    /// # 参数
    /// - `folder_path`: 游戏文件夹路径
    /// 
    /// # 返回
    /// - `Vec<String>` - 可执行文件路径列表
    /// 
    /// # 业务规则
    /// - 只扫描常见的可执行文件扩展名（.exe, .bat, .sh, .app 等）
    pub fn extract_start_files(folder_path: &str) -> Vec<String> {
        use std::fs;
        
        let path = std::path::Path::new(folder_path);
        if !path.exists() || !path.is_dir() {
            return Vec::new();
        }

        let executable_extensions = ["exe", "bat", "sh", "app", "command"];
        let mut start_files = Vec::new();

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        if let Some(extension) = entry.path().extension() {
                            if let Some(ext_str) = extension.to_str() {
                                if executable_extensions.contains(&ext_str.to_lowercase().as_str()) {
                                    if let Some(file_path) = entry.path().to_str() {
                                        start_files.push(file_path.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        start_files
    }

    /// 从文件夹路径提取游戏标题
    ///
    /// # 参数
    /// - `folder_path`: 文件夹路径
    ///
    /// # 返回
    /// - `String` - 提取的游戏标题
    ///
    /// # 业务规则
    /// - 使用文件夹名称作为标题
    pub fn extract_title_from_path(folder_path: &str) -> String {
        use std::path::Path;

        let path = Path::new(folder_path);
        path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown Game")
            .to_string()
    }

    /// 判断是否为有效的游戏文件夹
    /// 
    /// # 参数
    /// - `folder_path`: 文件夹路径
    /// 
    /// # 返回
    /// - `bool` - 是否为有效的游戏文件夹
    /// 
    /// # 业务规则
    /// - 文件夹必须存在
    /// - 文件夹中必须包含至少一个可执行文件
    pub fn is_valid_game_folder(folder_path: &str) -> bool {
        let start_files = Self::extract_start_files(folder_path);
        !start_files.is_empty()
    }
}

