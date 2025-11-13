//! 照片扫描库
//!
//! 提供照片文件扫描、EXIF 元数据提取和缩略图生成的功能。

pub mod models;
pub mod scanner;
pub mod helpers;

// 重新导出主要类型
pub use scanner::PhotoScanner;
pub use helpers::{photo_scan, photo_scan_with_options};

