-- 为 MediaLibrary 表添加 ConfigJson 字段
-- 用于存储不同类型媒体库的特定配置
-- SQLite 使用 TEXT 类型存储 JSON 数据

ALTER TABLE MediaLibrary
ADD COLUMN ConfigJson TEXT NOT NULL DEFAULT '{}';

-- ConfigJson 字段说明：
-- 1. 类型：TEXT（SQLite 推荐使用 TEXT 存储 JSON）
-- 2. 默认值：'{}' （空 JSON 对象）
-- 3. NOT NULL：确保字段始终有值
-- 4. 存储格式：JSON 字符串

-- 配置示例：
-- 游戏库: {"gameProviders": "IGDB,DLSITE", "metadataStorage": "database"}
-- 漫画库: {"comicFormats": "CBZ,CBR,PDF", "metadataStorage": "mixed"}
-- WebDAV: {"url": "https://...", "username": "...", "password": "...", "path": "/media"}

-- SQLite JSON 函数支持（SQLite 3.38.0+）：
-- SELECT json_extract(ConfigJson, '$.gameProviders') FROM MediaLibrary WHERE Id = 1;
-- SELECT * FROM MediaLibrary WHERE json_extract(ConfigJson, '$.metadataStorage') = 'database';

