/// TMDB API 支持的语言类型
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Language {
    /// 英语 (en-US)
    English,
    /// 简体中文 (zh-CN)
    ChineseSimplified,
    /// 繁体中文 (zh-TW)
    ChineseTraditional,
    /// 日语 (ja-JP)
    Japanese,
    /// 韩语 (ko-KR)
    Korean,
    /// 法语 (fr-FR)
    French,
    /// 德语 (de-DE)
    German,
    /// 西班牙语 (es-ES)
    Spanish,
    /// 意大利语 (it-IT)
    Italian,
    /// 葡萄牙语 (pt-BR)
    Portuguese,
    /// 俄语 (ru-RU)
    Russian,
}

impl Language {
    /// 获取 TMDB API 使用的语言代码
    pub fn code(&self) -> &'static str {
        match self {
            Language::English => "en-US",
            Language::ChineseSimplified => "zh-CN",
            Language::ChineseTraditional => "zh-TW",
            Language::Japanese => "ja-JP",
            Language::Korean => "ko-KR",
            Language::French => "fr-FR",
            Language::German => "de-DE",
            Language::Spanish => "es-ES",
            Language::Italian => "it-IT",
            Language::Portuguese => "pt-BR",
            Language::Russian => "ru-RU",
        }
    }

    /// 获取语言的显示名称
    pub fn display_name(&self) -> &'static str {
        match self {
            Language::English => "English",
            Language::ChineseSimplified => "简体中文",
            Language::ChineseTraditional => "繁體中文",
            Language::Japanese => "日本語",
            Language::Korean => "한국어",
            Language::French => "Français",
            Language::German => "Deutsch",
            Language::Spanish => "Español",
            Language::Italian => "Italiano",
            Language::Portuguese => "Português",
            Language::Russian => "Русский",
        }
    }
}

impl Default for Language {
    fn default() -> Self {
        Language::ChineseSimplified
    }
}

