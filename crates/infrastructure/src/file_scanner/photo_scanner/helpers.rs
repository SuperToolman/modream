//! 照片扫描辅助函数

use super::models::photo::PhotoScanResult;
use super::models::scan_options::ScanOptions;
use super::scanner::PhotoScanner;

/// 使用默认选项扫描照片目录
///
/// # 参数
/// * `dir_path` - 要扫描的目录路径
///
/// # 返回值
/// 返回 `Result<Vec<PhotoScanResult>, String>`，包含扫描到的照片列表或错误信息
///
/// # 示例
/// ```no_run
/// use photo_scanner::helpers::photo_scan;
///
/// #[tokio::main]
/// async fn main() {
///     let results = photo_scan("./photos".to_string()).await.unwrap();
///     println!("找到 {} 张照片", results.len());
/// }
/// ```
pub async fn photo_scan(dir_path: String) -> Result<Vec<PhotoScanResult>, String> {
    PhotoScanner::new().scan(dir_path).await
}

/// 使用自定义选项扫描照片目录
///
/// # 参数
/// * `dir_path` - 要扫描的目录路径
/// * `options` - 扫描选项
///
/// # 返回值
/// 返回 `Result<Vec<PhotoScanResult>, String>`，包含扫描到的照片列表或错误信息
///
/// # 示例
/// ```no_run
/// use photo_scanner::helpers::photo_scan_with_options;
/// use photo_scanner::models::scan_options::ScanOptions;
///
/// #[tokio::main]
/// async fn main() {
///     let mut options = ScanOptions::default();
///     options.generate_thumbnail = false;
///     
///     let results = photo_scan_with_options("./photos".to_string(), options)
///         .await
///         .unwrap();
///     println!("找到 {} 张照片", results.len());
/// }
/// ```
pub async fn photo_scan_with_options(
    dir_path: String,
    options: ScanOptions,
) -> Result<Vec<PhotoScanResult>, String> {
    PhotoScanner::new().with_options(options).scan(dir_path).await
}

