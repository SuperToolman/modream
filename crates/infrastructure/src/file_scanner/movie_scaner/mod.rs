//! 电影扫描库
//!
//! 提供视频文件扫描和元数据提取的功能。
//! 支持多种元数据提供者（TMDB、豆瓣等）和灵活的扫描模式。

pub mod models;
pub mod provider;
pub mod scanner;
pub mod helpers;

// 重新导出主要类型
pub use scanner::MovieScan;
pub use helpers::{video_scan, video_scan_with_language, video_scan_with_options};