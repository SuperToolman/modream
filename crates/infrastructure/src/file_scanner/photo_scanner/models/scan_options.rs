//! 照片扫描选项

use serde::{Deserialize, Serialize};

/// 缩略图缩放算法
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ThumbnailResizeFilter {
    /// Triangle 算法（快速，质量好）- 推荐默认
    Triangle,
    /// CatmullRom 算法（中等速度，高质量）
    CatmullRom,
    /// Lanczos3 算法（最慢，最高质量）
    Lanczos3,
}

impl ThumbnailResizeFilter {
    /// 转换为 image crate 的 FilterType
    pub fn to_image_filter(&self) -> image::imageops::FilterType {
        match self {
            Self::Triangle => image::imageops::FilterType::Triangle,
            Self::CatmullRom => image::imageops::FilterType::CatmullRom,
            Self::Lanczos3 => image::imageops::FilterType::Lanczos3,
        }
    }
}

impl Default for ThumbnailResizeFilter {
    fn default() -> Self {
        Self::Triangle // 默认使用 Triangle（快速且质量好）
    }
}

/// 照片扫描选项
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanOptions {
    /// 是否生成缩略图
    pub generate_thumbnail: bool,

    /// 缩略图最大宽度
    pub thumbnail_max_width: u32,

    /// 缩略图最大高度
    pub thumbnail_max_height: u32,

    /// 缩略图缩放算法
    pub thumbnail_resize_filter: ThumbnailResizeFilter,

    /// 缩略图保存目录
    pub thumbnail_dir: Option<String>,

    /// 是否计算文件哈希
    pub calculate_hash: bool,

    /// 是否提取 EXIF 信息
    pub extract_exif: bool,

    /// 支持的图片格式
    pub supported_formats: Vec<String>,
}

impl Default for ScanOptions {
    fn default() -> Self {
        Self {
            generate_thumbnail: true,
            thumbnail_max_width: 400,
            thumbnail_max_height: 400,
            thumbnail_resize_filter: ThumbnailResizeFilter::default(),
            thumbnail_dir: None,
            calculate_hash: true,
            extract_exif: true,
            supported_formats: vec![
                "jpg".to_string(),
                "jpeg".to_string(),
                "png".to_string(),
                "gif".to_string(),
                "bmp".to_string(),
                "webp".to_string(),
                "tiff".to_string(),
                "heic".to_string(),
                "heif".to_string(),
            ],
        }
    }
}

