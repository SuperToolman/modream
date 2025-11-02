use gamebox::models::game_info::GameInfo;
use gamebox::scan::GameScanner;

/// 扫描游戏文件夹（异步版本）
///
/// # 参数
/// - `path`: 要扫描的根路径
/// - `providers`: 游戏数据库提供者列表（如 "IGDB,DLSITE,STEAMDB"）
///
/// # 返回
/// - `anyhow::Result<Vec<GameInfo>>` - 扫描到的游戏信息列表（直接返回 gamebox 的 GameInfo）
///
/// # 职责
/// - ✅ 使用 gamebox 库扫描文件夹并刮削游戏元数据
/// - ✅ 自动计算游戏文件夹大小
/// - ❌ 不包含业务规则验证（由领域层处理）
/// - ❌ 不包含数据转换（由 Application 层或 Domain 层处理）
///
/// # 示例
/// ```rust,no_run
/// use infrastructure::file_scanner::scan_game_folders;
///
/// #[tokio::main]
/// async fn main() {
///     let games = scan_game_folders("D:/Games", "IGDB,DLSITE").await.unwrap();
///     println!("Found {} games", games.len());
/// }
/// ```
pub async fn scan_game_folders(path: &str, providers: &str) -> Result<Vec<GameInfo>, String> {
    tracing::info!("Scanning game folders in path: {}, providers: {}", path, providers);

    // 创建 GameScanner 并配置提供者
    let mut scanner = GameScanner::new();

    // 解析提供者列表并配置 scanner
    let provider_list: Vec<String> = providers
        .split(',')
        .map(|s| s.trim().to_uppercase())
        .filter(|s| !s.is_empty())
        .collect();

    tracing::debug!("Configuring providers: {:?}", provider_list);

    // 获取全局配置
    let config = shared::config::get();
    let gamebox_config = config.gamebox();

    // 根据提供者列表配置 scanner
    for provider in &provider_list {
        scanner = match provider.as_str() {
            "DLSITE" => scanner.with_dlsite_provider().await,
            "IGDB" => {
                // 从配置中读取 IGDB 凭证
                if gamebox_config.is_igdb_configured() {
                    if let Some((client_id, client_secret)) = gamebox_config.get_igdb_credentials() {
                        tracing::info!("Configuring IGDB provider with credentials from config");
                        scanner.with_igdb_provider(client_id, client_secret).await
                    } else {
                        tracing::warn!("IGDB enabled but credentials not found, skipping");
                        scanner
                    }
                } else {
                    tracing::warn!("IGDB provider not configured (set gamebox.igdb.enabled=true and provide credentials in application.yaml), skipping");
                    scanner
                }
            },
            "THEGAMESDB" | "STEAMDB" => scanner.with_thegamesdb_provider().await,
            _ => {
                tracing::warn!("Unknown provider: {}, skipping", provider);
                scanner
            }
        };
    }

    // 使用 gamebox 扫描游戏
    tracing::info!("Starting game scan with gamebox...");
    let game_infos = scanner.scan(path.to_string()).await;

    tracing::info!("Found {} games from gamebox", game_infos.len());
    Ok(game_infos)
}

