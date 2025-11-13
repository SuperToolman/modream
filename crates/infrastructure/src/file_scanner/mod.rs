mod scan;
mod scan_by_game;
mod scan_by_manga;
mod scan_by_video;
pub mod movie_scaner;
pub mod photo_scanner;

pub use scan::scan;
pub use scan_by_game::scan_game_folders;
pub use scan_by_manga::{scan_folders_v2, MangaScanResult, ChapterInfo};
pub use scan_by_video::scan_by_video;

// 重新导出电影扫描相关的类型和函数
pub use movie_scaner::{
    MovieScan,
    video_scan,
    video_scan_with_language,
    video_scan_with_options,
};

// 重新导出照片扫描相关的类型和函数
pub use photo_scanner::{
    PhotoScanner,
    photo_scan,
    photo_scan_with_options,
};

