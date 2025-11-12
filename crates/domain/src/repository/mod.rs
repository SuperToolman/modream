/// Repository 模块 - 定义数据访问接口
/// 按实体类型组织，每个实体有独立的 Repository Trait

pub mod game;
pub mod manga;
pub mod manga_chapter;
pub mod media_library;
pub mod movie;
pub mod user;

pub use game::GameRepository;
pub use manga::MangaRepository;
pub use manga_chapter::MangaChapterRepository;
pub use media_library::MediaLibraryRepository;
pub use movie::MovieRepository;
pub use user::UserRepository;