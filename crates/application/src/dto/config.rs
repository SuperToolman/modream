use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

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
    /// IGDB 配置
    pub igdb: UpdateIgdbConfigRequest,
    /// DLSite 配置
    pub dlsite: UpdateDlsiteConfigRequest,
    /// SteamDB 配置
    pub steamdb: UpdateSteamdbConfigRequest,
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

    /// 是否启用 IGDB 提供者
    #[schema(example = true)]
    pub enabled: bool,
}

/// 更新 DLSite 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateDlsiteConfigRequest {
    /// 是否启用 DLSite 提供者
    #[schema(example = true)]
    pub enabled: bool,
}

/// 更新 SteamDB 配置请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateSteamdbConfigRequest {
    /// 是否启用 SteamDB 提供者
    #[schema(example = true)]
    pub enabled: bool,
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

