use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// ==================== Server 配置相关 DTO ====================

/// Server 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct ServerConfigResponse {
    pub port: u16,
    pub api_url: String,
    pub mode: String,
    pub auto_start_api: bool,
}

impl From<&shared::config::ServerConfig> for ServerConfigResponse {
    fn from(config: &shared::config::ServerConfig) -> Self {
        Self {
            port: config.port(),
            api_url: config.api_url().to_string(),
            mode: format!("{:?}", config.mode()).to_lowercase(),
            auto_start_api: config.auto_start_api(),
        }
    }
}

/// 更新 Server 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateServerConfigRequest {
    pub port: Option<u16>,
    pub api_url: Option<String>,
    pub mode: Option<String>,
    pub auto_start_api: Option<bool>,
}

// ==================== Database 配置相关 DTO ====================

/// Database 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct DatabaseConfigResponse {
    pub host: String,
    pub port: u16,
    pub user: String,
    #[serde(skip_serializing)]  // 不返回密码
    pub password: String,
    pub database: String,
    pub schema: String,
    pub sqlite_database_url: String,
}

impl From<&shared::config::DatabaseConfig> for DatabaseConfigResponse {
    fn from(config: &shared::config::DatabaseConfig) -> Self {
        Self {
            host: config.host().to_string(),
            port: config.port(),
            user: config.user().to_string(),
            password: "***".to_string(),  // 密码脱敏
            database: config.database().to_string(),
            schema: config.schema().to_string(),
            sqlite_database_url: config.sqlite_database_url().to_string(),
        }
    }
}

/// 更新 Database 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateDatabaseConfigRequest {
    pub host: Option<String>,
    pub port: Option<u16>,
    pub user: Option<String>,
    pub password: Option<String>,
    pub database: Option<String>,
    pub schema: Option<String>,
    pub sqlite_database_url: Option<String>,
}

// ==================== Movie 配置相关 DTO ====================

/// Movie 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MovieConfigResponse {
    pub tmdb: TmdbConfigResponse,
}

/// TMDB 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct TmdbConfigResponse {
    #[serde(skip_serializing)]  // 不返回 API Key
    pub api_key: String,
    pub enabled: bool,
}

/// 更新 Movie 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateMovieConfigRequest {
    pub tmdb: Option<UpdateTmdbConfigRequest>,
}

/// 更新 TMDB 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateTmdbConfigRequest {
    pub api_key: Option<String>,
    pub enabled: Option<bool>,
}

// ==================== Gamebox 配置相关 DTO ====================

/// Gamebox 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GameboxConfigResponse {
    /// IGDB 配置
    pub igdb: IgdbConfigResponse,
    /// DLSite 配置
    pub dlsite: DlsiteConfigResponse,
    /// SteamDB 配置
    pub steamdb: SteamdbConfigResponse,
}

/// IGDB 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct IgdbConfigResponse {
    /// IGDB Client ID（脱敏显示）
    #[schema(example = "8v3v****qktr")]
    pub client_id_masked: Option<String>,

    /// 是否已配置 Client ID
    #[schema(example = true)]
    pub has_client_id: bool,

    /// 是否已配置 Client Secret
    #[schema(example = true)]
    pub has_client_secret: bool,

    /// 是否启用 IGDB 提供者
    #[schema(example = true)]
    pub enabled: bool,
}

/// DLSite 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct DlsiteConfigResponse {
    /// 是否启用 DLSite 提供者
    #[schema(example = true)]
    pub enabled: bool,
}

/// SteamDB 配置响应 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SteamdbConfigResponse {
    /// 是否启用 SteamDB 提供者
    #[schema(example = true)]
    pub enabled: bool,
}

/// 更新 Gamebox 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateGameboxConfigRequest {
    /// IGDB 配置（如果为 None 则不更新）
    pub igdb: Option<UpdateIgdbConfigRequest>,
    /// DLSite 配置（如果为 None 则不更新）
    pub dlsite: Option<UpdateDlsiteConfigRequest>,
    /// SteamDB 配置（如果为 None 则不更新）
    pub steamdb: Option<UpdateSteamdbConfigRequest>,
}

/// 更新 IGDB 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateIgdbConfigRequest {
    /// IGDB Client ID（如果为 None 则不更新）
    #[schema(example = "your_client_id")]
    pub client_id: Option<String>,

    /// IGDB Client Secret（如果为 None 则不更新）
    #[schema(example = "your_client_secret")]
    pub client_secret: Option<String>,

    /// 是否启用 IGDB 提供者（如果为 None 则不更新）
    #[schema(example = true)]
    pub enabled: Option<bool>,
}

/// 更新 DLSite 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateDlsiteConfigRequest {
    /// 是否启用 DLSite 提供者（如果为 None 则不更新）
    #[schema(example = true)]
    pub enabled: Option<bool>,
}

/// 更新 SteamDB 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateSteamdbConfigRequest {
    /// 是否启用 SteamDB 提供者（如果为 None 则不更新）
    #[schema(example = true)]
    pub enabled: Option<bool>,
}

impl From<&shared::config::GameboxConfig> for GameboxConfigResponse {
    fn from(config: &shared::config::GameboxConfig) -> Self {
        Self {
            igdb: IgdbConfigResponse {
                client_id_masked: config.igdb.client_id.as_ref().map(|id| {
                    if id.len() > 8 {
                        format!("{}****{}", &id[..4], &id[id.len()-4..])
                    } else {
                        "****".to_string()
                    }
                }),
                has_client_id: config.igdb.client_id.is_some(),
                has_client_secret: config.igdb.client_secret.is_some(),
                enabled: config.igdb.enabled,
            },
            dlsite: DlsiteConfigResponse {
                enabled: config.dlsite.enabled,
            },
            steamdb: SteamdbConfigResponse {
                enabled: config.steamdb.enabled,
            },
        }
    }
}

