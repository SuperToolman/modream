/// DTO 模块 - 应用层与外部接口的数据传输对象
///
/// 按功能分模块划分，每个模块对应一个业务领域的 DTO

pub mod auth;
pub mod user;
pub mod media_library;
pub mod manga;
pub mod manga_chapter;
pub mod game;
pub mod common;
pub mod config;

// 重新导出常用的 DTO
pub use auth::{LoginRequest, LoginResponse};
pub use user::{RegisterRequest, UserInfo};
pub use media_library::{CreateMediaLibraryRequest, MediaLibraryInfo};
pub use manga::{CreateMangaRequest, MangaInfo, PagedResponse};
pub use manga_chapter::MangaChapterInfo;
pub use game::{CreateGameRequest, GameInfo};
pub use common::PaginationQuery;
pub use config::{GameboxConfigResponse, UpdateGameboxConfigRequest};