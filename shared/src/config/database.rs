use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    host: Option<String>,
    port: Option<u16>,
    user: Option<String>,
    password: Option<String>,
    database: Option<String>,
    schema: Option<String>,
    sqlite_database_url: Option<String>,
}

impl DatabaseConfig {
    pub fn host(&self) -> &str {
        self.host.as_deref().unwrap_or("localhost")
    }
    pub fn port(&self) -> u16 {
        self.port.unwrap_or(5432)
    }
    pub fn user(&self) -> &str {
        self.user.as_deref().unwrap_or("postgres")
    }
    pub fn password(&self) -> &str {
        self.password.as_deref().unwrap_or("postgres")
    }
    pub fn database(&self) -> &str {
        self.database.as_deref().unwrap_or("postgres")
    }
    pub fn schema(&self) -> &str {
        self.schema.as_deref().unwrap_or("public")
    }
    pub fn sqlite_database_url(&self) -> &str {
        self.sqlite_database_url
            .as_deref()
            .unwrap_or("sqlite://data/my_app.db?mode=rwc")
    }
}
