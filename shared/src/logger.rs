// 导入所需模块
// EnvFilter 用于根据环境变量配置日志过滤规则
use tracing_subscriber::EnvFilter;
// SubscriberInitExt 提供了初始化订阅者的扩展方法
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

/// 初始化应用程序的日志记录系统
///
/// 这个函数配置了一个结构化的日志记录器，具有以下特性：
/// - 支持通过环境变量动态设置日志级别
/// - 显示详细的源代码位置信息
/// - 包含多线程调试信息
/// - 使用美观的格式化输出
///
/// # 环境变量配置
/// 可以通过设置 `RUST_LOG` 环境变量来控制日志级别，例如：
/// - `RUST_LOG=debug`    // 启用调试级别及以上的日志
/// - `RUST_LOG=my_crate=info`  // 为特定crate设置级别
/// - `RUST_LOG=info,warn`      // 设置多个级别
///
/// # 示例用法
/// ```
/// fn main() {
///     // 在应用程序入口处初始化日志系统
///     init();
///     
///     // 现在可以使用 tracing 宏记录日志
///     tracing::info!("应用程序启动成功");
///     tracing::debug!("调试信息：{:?}", some_data);
///     tracing::error!("发生错误");
/// }
/// ```
pub fn init() {
    // 创建并配置日志订阅者注册表
    tracing_subscriber::registry()
        // 配置日志级别过滤器
        // 首先尝试从环境变量读取配置，如果失败则使用默认的 "debug" 级别
        .with(
            EnvFilter::try_from_default_env()
                // 如果环境变量未设置或格式错误，回退到默认的 "debug" 级别
                // 这意味着默认会显示 debug、info、warn、error 级别的日志
                .unwrap_or_else(|_| EnvFilter::new("debug")),
        )
        // 配置日志输出格式
        .with(
            tracing_subscriber::fmt::layer()
                .with_file(true) // 启用源代码文件路径显示 - 帮助定位日志来源
                .with_line_number(true) // 启用代码行号显示 - 与文件路径结合可精确定位代码位置
                .with_thread_ids(true) // 启用线程ID显示 - 便于调试多线程应用程序
                .with_thread_names(true) // 启用线程名称显示 - 如果线程有命名，会显示线程名
                .with_target(false), // 禁用目标显示 - 不显示产生日志的模块路径，使输出更简洁
                                     // 注意：这里还可以添加其他配置，如：
                                     // .with_ansi(true)       // 启用彩色输出（默认启用）
                                     // .with_writer(std::io::stderr)  // 指定输出目标
                                     // .json()                // 使用JSON格式而不是文本格式
        )
        // 初始化并设置此配置为全局默认订阅者
        // 此后，所有通过 tracing 宏记录的日志都会使用这个配置
        .init();

    // 初始化完成后，可以记录一条信息确认日志系统已就绪
    tracing::info!("Log system initialization completed.");
}

pub fn write_log(_content: String) {
    todo!()
}
