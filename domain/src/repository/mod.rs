/// Repository 模块 - 定义数据访问接口
/// 按实体类型组织，每个实体有独立的 Repository Trait

pub mod user;
pub mod media_library;
pub mod manga;

pub use user::UserRepository;
pub use media_library::MediaLibraryRepository;
pub use manga::MangaRepository;

