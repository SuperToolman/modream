/// 领域服务模块
/// 
/// 领域服务封装了不属于单个实体的业务逻辑，包括：
/// - 业务规则验证
/// - 跨实体的业务操作
/// - 复杂的业务计算
/// 
/// 领域服务的特点：
/// - 无状态（Stateless）
/// - 不依赖基础设施层
/// - 只包含纯业务逻辑

pub mod manga_service;
pub mod media_library_service;

pub use manga_service::MangaDomainService;
pub use media_library_service::MediaLibraryDomainService;

