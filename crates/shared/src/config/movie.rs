use serde::Deserialize;

/// Movie 配置
#[derive(Debug, Deserialize, Clone)]
pub struct MovieConfig {
    /// TMDB 配置
    #[serde(default)]
    pub tmdb: TmdbConfig,
}

impl Default for MovieConfig {
    fn default() -> Self {
        Self {
            tmdb: TmdbConfig::default(),
        }
    }
}

impl MovieConfig {
    pub fn tmdb(&self) -> &TmdbConfig {
        &self.tmdb
    }
}

/// TMDB 配置
#[derive(Debug, Deserialize, Clone)]
pub struct TmdbConfig {
    /// TMDB API Key
    #[serde(default = "default_api_key")]
    pub api_key: String,
    
    /// 是否启用 TMDB
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

impl Default for TmdbConfig {
    fn default() -> Self {
        Self {
            api_key: default_api_key(),
            enabled: default_enabled(),
        }
    }
}

impl TmdbConfig {
    pub fn api_key(&self) -> &str {
        &self.api_key
    }
    
    pub fn enabled(&self) -> bool {
        self.enabled
    }
}

fn default_api_key() -> String {
    "your_tmdb_api_key".to_string()
}

fn default_enabled() -> bool {
    true
}

