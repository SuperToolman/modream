# 媒体库配置设计文档

## 📋 概述

本文档说明如何使用 `config_json` 字段存储不同类型媒体库的特定配置。

## 🎯 设计方案

### 数据库设计

在 `MediaLibrary` 表中添加 `ConfigJson` 字段（TEXT 类型）：

```sql
ALTER TABLE MediaLibrary 
ADD COLUMN ConfigJson TEXT DEFAULT '{}';
```

### 数据流程

```
前端表单 → API 请求 → 应用服务 → 领域模型 → 数据库
   ↓          ↓          ↓          ↓         ↓
 JSON对象   JSON对象   JSON字符串  JSON字符串  TEXT
```

## 📊 数据结构示例

### 1. 游戏库配置

```json
{
  "gameProviders": "IGDB,DLSITE,STEAMDB",
  "metadataStorage": "database"
}
```

### 2. 漫画库配置

```json
{
  "comicFormats": "CBZ,CBR,PDF,EPUB",
  "metadataStorage": "mixed"
}
```

### 3. WebDAV 库配置

```json
{
  "url": "https://webdav.example.com",
  "username": "user",
  "password": "encrypted_password",
  "path": "/media"
}
```

## 🔄 完整流程示例

### 前端提交数据

```typescript
// tauri-app/lib/api/media-library.ts
const createLibrary = async (data: {
  name: string;
  type: "游戏" | "漫画" | "影片";
  source: "local" | "webdav";
  folders: string[];
  config: {
    gameProviders?: string;
    comicFormats?: string;
    metadataStorage?: string;
  };
}) => {
  const response = await fetch('/api/media-library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.name,
      type: data.type,
      source: data.source,
      paths_json: JSON.stringify(data.folders),
      config: data.config, // 直接传递 JSON 对象
    }),
  });
  return response.json();
};

// 使用示例
await createLibrary({
  name: "我的游戏库",
  type: "游戏",
  source: "local",
  folders: ["D:/Games", "E:/SteamLibrary"],
  config: {
    gameProviders: "IGDB,STEAMDB",
    metadataStorage: "database",
  },
});
```

### 后端 DTO 定义

```rust
// application/src/dto/media_library.rs
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateMediaLibraryRequest {
    pub title: String,
    pub paths_json: String,
    pub source: String,
    #[serde(rename = "type")]
    pub media_type: String,
    
    /// 类型特定的配置（JSON 对象）
    #[serde(default)]
    pub config: Option<serde_json::Value>,
}
```

### 应用服务处理

```rust
// application/src/media_library_service.rs
pub async fn create(
    &self,
    req: CreateMediaLibraryRequest,
) -> anyhow::Result<MediaLibraryModel> {
    // 创建聚合根
    let mut aggregate = MediaLibraryAggregate::new(
        req.title,
        req.paths_json,
        req.source,
        req.media_type,
    )?;

    // 设置配置 JSON
    if let Some(config) = req.config {
        let config_json = serde_json::to_string(&config)?;
        aggregate.media_library.update_config(config_json)?;
    }

    // 保存到数据库
    let media_library = self.media_library_repo.create(aggregate.media_library).await?;
    Ok(media_library)
}
```

### 领域模型方法

```rust
// domain/src/entity/media_library.rs
impl Model {
    /// 更新配置 JSON
    pub fn update_config(&mut self, config_json: String) -> anyhow::Result<()> {
        // 验证 JSON 格式
        serde_json::from_str::<serde_json::Value>(&config_json)
            .map_err(|e| anyhow::anyhow!("无效的 JSON 格式: {}", e))?;
        
        self.config_json = config_json;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 获取配置对象
    pub fn get_config(&self) -> anyhow::Result<serde_json::Value> {
        serde_json::from_str(&self.config_json)
            .map_err(|e| anyhow::anyhow!("解析配置 JSON 失败: {}", e))
    }

    /// 获取配置中的特定字段
    pub fn get_config_value(&self, key: &str) -> Option<String> {
        self.get_config()
            .ok()
            .and_then(|config| config.get(key).and_then(|v| v.as_str().map(String::from)))
    }
}
```

### 数据库存储

| id | title | type | source | config_json |
|----|-------|------|--------|-------------|
| 1 | 我的游戏库 | 游戏 | local | `{"gameProviders":"IGDB,STEAMDB","metadataStorage":"database"}` |
| 2 | 漫画收藏 | 漫画 | local | `{"comicFormats":"CBZ,CBR","metadataStorage":"mixed"}` |

### 读取配置

```rust
// 查询媒体库
let library = media_library_repo.find_by_id(1).await?;

// 获取完整配置对象
let config = library.get_config()?;
println!("配置: {:?}", config);

// 获取特定配置项
if let Some(providers) = library.get_config_value("gameProviders") {
    let provider_list: Vec<&str> = providers.split(',').collect();
    println!("游戏数据库提供者: {:?}", provider_list);
    // 输出: ["IGDB", "STEAMDB"]
}
```

## 🎨 前端表单集成

### 本地媒体库表单

```typescript
// local-library-form.tsx
const handleSubmit = () => {
  const submitData = {
    name: formData.name,
    type: formData.type,
    source: "local",
    folders: formData.folders,
    config: {
      // 根据媒体类型动态添加配置
      ...(formData.type === "游戏" && {
        gameProviders: internalGameProviders.map(p => p.toUpperCase()).join(','),
        metadataStorage: formData.metadataStorage,
      }),
      ...(formData.type === "漫画" && {
        comicFormats: internalComicFormats.map(f => f.toUpperCase()).join(','),
        metadataStorage: formData.metadataStorage,
      }),
    },
  };
  
  onSubmit(submitData);
};
```

### WebDAV 媒体库表单

```typescript
// webdav-library-form.tsx
const handleSubmit = () => {
  const submitData = {
    name: formData.name,
    type: formData.type,
    source: "webdav",
    folders: [], // WebDAV 不需要本地文件夹
    config: {
      // WebDAV 特定配置
      url: formData.url,
      username: formData.username,
      password: formData.password,
      path: formData.path,
      // 媒体类型特定配置
      ...(formData.type === "游戏" && {
        gameProviders: internalGameProviders.map(p => p.toUpperCase()).join(','),
        metadataStorage: formData.metadataStorage,
      }),
      ...(formData.type === "漫画" && {
        comicFormats: internalComicFormats.map(f => f.toUpperCase()).join(','),
        metadataStorage: formData.metadataStorage,
      }),
    },
  };
  
  onSubmit(submitData);
};
```

## ✅ 优势

1. **灵活性**：每种媒体类型可以有完全不同的配置项
2. **可扩展性**：添加新配置项不需要修改数据库结构
3. **类型安全**：前端使用 TypeScript，后端使用 Rust 类型系统
4. **易于维护**：配置集中管理，逻辑清晰

## 🔧 使用配置的场景

### 场景 1：扫描游戏库时使用配置

```rust
// 扫描游戏库
let library = repo.find_by_id(library_id).await?;
let config = library.get_config()?;

if let Some(providers) = config.get("gameProviders").and_then(|v| v.as_str()) {
    let provider_list: Vec<&str> = providers.split(',').collect();
    
    for provider in provider_list {
        match provider {
            "IGDB" => fetch_from_igdb(&game_name).await?,
            "DLSITE" => fetch_from_dlsite(&game_name).await?,
            "STEAMDB" => fetch_from_steamdb(&game_name).await?,
            _ => {}
        }
    }
}
```

### 场景 2：扫描漫画库时过滤格式

```rust
// 扫描漫画库
let library = repo.find_by_id(library_id).await?;
let config = library.get_config()?;

if let Some(formats) = config.get("comicFormats").and_then(|v| v.as_str()) {
    let format_list: Vec<&str> = formats.split(',').collect();
    
    // 只扫描配置中指定的格式
    for entry in fs::read_dir(&path)? {
        let file_path = entry?.path();
        let extension = file_path.extension()
            .and_then(|s| s.to_str())
            .map(|s| s.to_uppercase());
        
        if let Some(ext) = extension {
            if format_list.contains(&ext.as_str()) {
                // 处理该文件
                process_comic_file(&file_path)?;
            }
        }
    }
}
```

## 📝 总结

通过在数据库中添加 `config_json` 字段，我们实现了：

1. ✅ 统一的 API 接口（所有类型的媒体库使用同一个创建接口）
2. ✅ 灵活的配置存储（不同类型可以有不同的配置项）
3. ✅ 类型安全的数据传递（前后端都有类型定义）
4. ✅ 易于扩展（添加新配置项不需要修改数据库结构）
5. ✅ 清晰的数据流（JSON 对象 → JSON 字符串 → 数据库）

