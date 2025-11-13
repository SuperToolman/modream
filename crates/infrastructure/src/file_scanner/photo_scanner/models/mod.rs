//! 照片扫描相关的数据模型

pub mod photo;
pub mod scan_options;

pub use photo::PhotoScanResult;
pub use scan_options::{ScanOptions, ThumbnailResizeFilter};

