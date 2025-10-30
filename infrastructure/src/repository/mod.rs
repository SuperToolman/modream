/// Repository 实现模块 - 数据访问层实现
/// 按实体类型组织，每个实体有独立的 Repository 实现

pub mod game;
pub mod manga;
pub mod media_library;
pub mod user;

pub use game::GameRepositoryImpl;
pub use manga::MangaRepositoryImpl;
pub use media_library::MediaLibraryRepositoryImpl;
pub use user::UserRepositoryImpl;

