pub mod entity;
pub mod value_object;
pub mod repository;
pub mod service;
pub mod aggregate;

// 重新导出常用的 Repository Trait
pub use repository::UserRepository;
pub use repository::MediaLibraryRepository;

// 重新导出领域服务
pub use service::MangaDomainService;
pub use service::MediaLibraryDomainService;

// 重新导出聚合根
pub use aggregate::MediaLibraryAggregate;
