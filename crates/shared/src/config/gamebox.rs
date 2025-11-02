use serde::Deserialize;

/// Gamebox 配置
/// 用于配置游戏元数据提供者的 API 凭证
#[derive(Debug, Clone, Deserialize)]
pub struct GameboxConfig {
    /// IGDB 配置
    #[serde(default)]
    pub igdb: IgdbConfig,
    #[serde(default)]
    pub dlsite: DlsiteConfig,
    #[serde(default)]
    pub steamdb: SteamdbConfig,
}

/// IGDB API 配置
#[derive(Debug, Clone, Deserialize)]
pub struct IgdbConfig {
    /// IGDB Client ID
    /// 从 https://api-docs.igdb.com/#account-creation 获取
    #[serde(default)]
    pub client_id: Option<String>,
    
    /// IGDB Client Secret
    /// 从 https://api-docs.igdb.com/#account-creation 获取
    #[serde(default)]
    pub client_secret: Option<String>,
    
    /// 是否启用 IGDB 提供者
    #[serde(default)]
    pub enabled: bool,
}

/// DLSite 配置
#[derive(Debug, Clone, Deserialize)]
pub struct DlsiteConfig {
    /// 是否启用 DLSite 提供者
    pub enabled: bool,
}

/// SteamDB 配置
#[derive(Debug, Clone, Deserialize)]
pub struct SteamdbConfig {
    /// 是否启用 SteamDB 提供者
    pub enabled: bool,
}


impl Default for IgdbConfig {
    fn default() -> Self {
        Self {
            client_id: None,
            client_secret: None,
            enabled: false,
        }
    }
}

impl Default for DlsiteConfig {
    fn default() -> Self {
        Self {
            enabled: false,
        }
    }
}

impl Default for SteamdbConfig {
    fn default() -> Self {
        Self {
            enabled: false,
        }
    }
}


impl Default for GameboxConfig {
    fn default() -> Self {
        Self {
            igdb: IgdbConfig::default(),
            dlsite: DlsiteConfig::default(),
            steamdb: SteamdbConfig::default(),
        }
    }
}

impl GameboxConfig {
    /// 检查 IGDB 是否已配置
    pub fn is_igdb_configured(&self) -> bool {
        self.igdb.enabled 
            && self.igdb.client_id.is_some() 
            && self.igdb.client_secret.is_some()
    }
    
    /// 获取 IGDB 凭证
    pub fn get_igdb_credentials(&self) -> Option<(String, String)> {
        if let (Some(client_id), Some(client_secret)) = 
            (&self.igdb.client_id, &self.igdb.client_secret) {
            Some((client_id.clone(), client_secret.clone()))
        } else {
            None
        }
    }
}

