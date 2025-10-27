/// Repository 实现模块 - 数据访问层实现
/// 按实体类型组织，每个实体有独立的 Repository 实现

pub mod user;
pub mod manga;
pub mod media_library;

pub use user::UserRepositoryImpl;
pub use manga::MangaRepositoryImpl;
pub use media_library::MediaLibraryRepositoryImpl;

