/// 视频扫描模式
#[derive(Debug, Clone, PartialEq)]
pub enum ScanMode {
    /// 扫描所有视频文件
    All,
    /// 只扫描可能是电影的视频（智能过滤）
    /// 参数：最小文件大小（字节），默认 300MB
    MoviesOnly { min_file_size: u64 },
}

impl Default for ScanMode {
    fn default() -> Self {
        ScanMode::MoviesOnly {
            min_file_size: 300 * 1024 * 1024, // 300MB
        }
    }
}

impl ScanMode {
    /// 创建一个自定义最小文件大小的 MoviesOnly 模式
    ///
    /// # 参数
    /// * `min_size_mb` - 最小文件大小（MB）
    pub fn movies_only_with_min_size(min_size_mb: u64) -> Self {
        ScanMode::MoviesOnly {
            min_file_size: min_size_mb * 1024 * 1024,
        }
    }
}

/// 视频文件过滤器
pub struct VideoFilter;

impl VideoFilter {
    /// 判断文件名是否可能是电影
    ///
    /// 过滤规则：
    /// 1. 排除包含特定关键词的文件（预告、样本、字幕等）
    /// 2. 排除文件太小的文件（根据 min_file_size 参数）
    ///
    /// # 参数
    /// * `file_name` - 文件名
    /// * `file_size` - 文件大小（字节）
    /// * `min_file_size` - 最小文件大小（字节）
    pub fn is_likely_movie(file_name: &str, file_size: u64, min_file_size: u64) -> bool {
        let name_lower = file_name.to_lowercase();

        // 排除关键词列表
        let exclude_keywords = [
            "trailer", "预告", "预告片",
            "sample", "样本", "样片",
            "subtitle", "字幕", "srt", "ass",
            "making", "花絮", "幕后",
            "interview", "访谈", "采访",
            "deleted", "删除", "未使用",
            "extra", "额外", "特典",
            "bonus", "特别",
            "test", "测试",
            "temp", "临时",
            "cache", "缓存",
        ];

        // 检查是否包含排除关键词
        for keyword in &exclude_keywords {
            if name_lower.contains(keyword) {
                return false;
            }
        }

        // 文件大小过滤
        if file_size < min_file_size {
            return false;
        }

        true
    }

    /// 从文件名中提取可能的电影标题
    ///
    /// 清理文件名中的无关信息：
    /// 1. 移除年份标记 (2015)、[2015]
    /// 2. 移除分辨率标记 1080p、720p、4K
    /// 3. 移除编码格式 x264、h265、HEVC
    /// 4. 移除音频格式 AAC、DTS、AC3
    /// 5. 移除发布组标记
    /// 6. 移除多余的符号和空格
    pub fn extract_movie_title(file_name: &str) -> String {
        // 移除扩展名
        let name = if let Some(pos) = file_name.rfind('.') {
            &file_name[..pos]
        } else {
            file_name
        };

        let mut title = name.to_string();

        // 先移除常见的分隔符和发布组标记（在 [] 或 {} 中）
        title = regex::Regex::new(r"\[.*?\]")
            .unwrap()
            .replace_all(&title, " ")
            .to_string();
        title = regex::Regex::new(r"\{.*?\}")
            .unwrap()
            .replace_all(&title, " ")
            .to_string();

        // 替换常见分隔符为空格（这样可以创建单词边界）
        for sep in &['.', '_', '-'] {
            title = title.replace(*sep, " ");
        }

        // 移除年份 (2015)、(2015)
        title = regex::Regex::new(r"\(\d{4}\)")
            .unwrap()
            .replace_all(&title, " ")
            .to_string();

        // 移除单独的年份数字
        title = regex::Regex::new(r"\b\d{4}\b")
            .unwrap()
            .replace_all(&title, " ")
            .to_string();

        // 移除分辨率标记
        let resolution_patterns = [
            "2160p", "1080p", "720p", "480p", "360p",
            "4K", "UHD", "BluRay", "BDRip", "WEB DL", "WEBRip", "DVDRip", "HDR",
        ];
        for pattern in &resolution_patterns {
            let regex_pattern = format!(r"(?i)\b{}\b", regex::escape(pattern));
            if let Ok(re) = regex::Regex::new(&regex_pattern) {
                title = re.replace_all(&title, " ").to_string();
            }
        }

        // 移除编码格式
        let codec_patterns = [
            "x264", "x265", "H264", "H265", "HEVC", "AVC",
            "10bit", "8bit",
        ];
        for pattern in &codec_patterns {
            let regex_pattern = format!(r"(?i)\b{}\b", regex::escape(pattern));
            if let Ok(re) = regex::Regex::new(&regex_pattern) {
                title = re.replace_all(&title, " ").to_string();
            }
        }

        // 移除音频格式
        let audio_patterns = [
            "AAC", "AC3", "DTS", "TrueHD", "Atmos",
        ];
        for pattern in &audio_patterns {
            let regex_pattern = format!(r"(?i)\b{}\b", regex::escape(pattern));
            if let Ok(re) = regex::Regex::new(&regex_pattern) {
                title = re.replace_all(&title, " ").to_string();
            }
        }

        // 移除多余空格
        title = title.split_whitespace().collect::<Vec<_>>().join(" ");

        // 去除首尾空格
        title.trim().to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_likely_movie() {
        const MIN_SIZE: u64 = 300 * 1024 * 1024; // 300MB

        // 应该被识别为电影（大于 300MB）
        assert!(VideoFilter::is_likely_movie("星际穿越.mp4", 2_000_000_000, MIN_SIZE));
        assert!(VideoFilter::is_likely_movie("Interstellar.mkv", 5_000_000_000, MIN_SIZE));
        assert!(VideoFilter::is_likely_movie("复仇者联盟.mp4", 400_000_000, MIN_SIZE));
        assert!(VideoFilter::is_likely_movie("a.mp4", 400_000_000, MIN_SIZE)); // 2个字的电影也可以

        // 应该被过滤掉（包含排除关键词）
        assert!(!VideoFilter::is_likely_movie("预告片.mp4", 500_000_000, MIN_SIZE));
        assert!(!VideoFilter::is_likely_movie("trailer.mp4", 500_000_000, MIN_SIZE));
        assert!(!VideoFilter::is_likely_movie("字幕.srt", 500_000_000, MIN_SIZE));
        assert!(!VideoFilter::is_likely_movie("test.mp4", 500_000_000, MIN_SIZE));

        // 应该被过滤掉（文件太小）
        assert!(!VideoFilter::is_likely_movie("星际穿越.mp4", 50_000_000, MIN_SIZE));
        assert!(!VideoFilter::is_likely_movie("Interstellar.mkv", 100_000_000, MIN_SIZE));
    }

    #[test]
    fn test_extract_movie_title() {
        let title1 = VideoFilter::extract_movie_title("星际穿越.Interstellar.2014.1080p.BluRay.x264.AAC.mp4");
        println!("Test 1: '{}'", title1);
        assert_eq!(title1, "星际穿越 Interstellar");

        let title2 = VideoFilter::extract_movie_title("Pixels (2015) [1080p] x265.mkv");
        println!("Test 2: '{}'", title2);
        assert_eq!(title2, "Pixels");

        let title3 = VideoFilter::extract_movie_title("The.Matrix.1999.2160p.UHD.BluRay.x265.10bit.HDR.mkv");
        println!("Test 3: '{}'", title3);
        assert_eq!(title3, "The Matrix");

        let title4 = VideoFilter::extract_movie_title("复仇者联盟4.Avengers.Endgame.2019.WEB-DL.1080p.H264.AAC.mp4");
        println!("Test 4: '{}'", title4);
        assert_eq!(title4, "复仇者联盟4 Avengers Endgame");
    }
}

