-- ============================================================================
-- SQLite 迁移脚本：为 MediaLibrary 表添加 ConfigJson 字段
-- ============================================================================
-- 版本：1.0
-- 日期：2025-10-29
-- 说明：添加 ConfigJson 字段用于存储不同类型媒体库的特定配置
-- ============================================================================

-- 1. 添加 ConfigJson 字段
-- SQLite 使用 TEXT 类型存储 JSON 数据
ALTER TABLE MediaLibrary 
ADD COLUMN ConfigJson TEXT NOT NULL DEFAULT '{}';

-- 2. 验证字段是否添加成功
-- 查看表结构
PRAGMA table_info(MediaLibrary);

-- 3. 为现有数据设置默认配置（可选）
-- 如果有现有的媒体库记录，可以根据类型设置默认配置

-- 为游戏库设置默认配置
UPDATE MediaLibrary 
SET ConfigJson = '{"gameProviders":"IGDB","metadataStorage":"database"}'
WHERE MediaType = '游戏' AND ConfigJson = '{}';

-- 为漫画库设置默认配置
UPDATE MediaLibrary 
SET ConfigJson = '{"comicFormats":"CBZ,CBR","metadataStorage":"database"}'
WHERE MediaType = '漫画' AND ConfigJson = '{}';

-- ============================================================================
-- 配置字段说明
-- ============================================================================

-- ConfigJson 字段规范：
-- 1. 类型：TEXT（SQLite 推荐使用 TEXT 存储 JSON）
-- 2. 默认值：'{}' （空 JSON 对象）
-- 3. NOT NULL：确保字段始终有值
-- 4. 存储格式：JSON 字符串（必须是有效的 JSON 格式）

-- ============================================================================
-- 配置示例
-- ============================================================================

-- 游戏库配置示例：
-- {
--   "gameProviders": "IGDB,DLSITE,STEAMDB",
--   "metadataStorage": "database"
-- }

-- 漫画库配置示例：
-- {
--   "comicFormats": "CBZ,CBR,PDF,EPUB",
--   "metadataStorage": "mixed"
-- }

-- WebDAV 库配置示例：
-- {
--   "url": "https://webdav.example.com",
--   "username": "user",
--   "password": "encrypted_password",
--   "path": "/media",
--   "gameProviders": "IGDB,STEAMDB",
--   "metadataStorage": "database"
-- }

-- ============================================================================
-- SQLite JSON 函数使用示例（需要 SQLite 3.38.0+）
-- ============================================================================

-- 查询特定配置项：
-- SELECT Id, Title, json_extract(ConfigJson, '$.gameProviders') AS GameProviders
-- FROM MediaLibrary 
-- WHERE MediaType = '游戏';

-- 根据配置项筛选：
-- SELECT * FROM MediaLibrary 
-- WHERE json_extract(ConfigJson, '$.metadataStorage') = 'database';

-- 检查配置项是否存在：
-- SELECT * FROM MediaLibrary 
-- WHERE json_extract(ConfigJson, '$.gameProviders') IS NOT NULL;

-- 更新配置项：
-- UPDATE MediaLibrary 
-- SET ConfigJson = json_set(ConfigJson, '$.gameProviders', 'IGDB,DLSITE,STEAMDB')
-- WHERE Id = 1;

-- 添加新配置项：
-- UPDATE MediaLibrary 
-- SET ConfigJson = json_insert(ConfigJson, '$.newField', 'newValue')
-- WHERE Id = 1;

-- 删除配置项：
-- UPDATE MediaLibrary 
-- SET ConfigJson = json_remove(ConfigJson, '$.oldField')
-- WHERE Id = 1;

-- ============================================================================
-- 验证查询
-- ============================================================================

-- 查看所有媒体库的配置：
-- SELECT Id, Title, MediaType, ConfigJson FROM MediaLibrary;

-- 验证 JSON 格式是否有效：
-- SELECT Id, Title, 
--        CASE 
--          WHEN json_valid(ConfigJson) = 1 THEN 'Valid'
--          ELSE 'Invalid'
--        END AS JsonStatus
-- FROM MediaLibrary;

-- ============================================================================
-- 回滚脚本（如果需要撤销更改）
-- ============================================================================

-- 注意：SQLite 不支持 DROP COLUMN，需要重建表
-- 如果需要回滚，请执行以下步骤：

-- 1. 创建备份表
-- CREATE TABLE MediaLibrary_backup AS SELECT * FROM MediaLibrary;

-- 2. 删除原表
-- DROP TABLE MediaLibrary;

-- 3. 重新创建原表（不包含 ConfigJson 字段）
-- CREATE TABLE MediaLibrary(
--     Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
--     CreateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
--     UpdateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
--     Title TEXT NOT NULL,
--     PathsJson TEXT NOT NULL,
--     Source TEXT NOT NULL CHECK(Source IN ('local', 'webdav')),
--     MediaType TEXT NOT NULL CHECK(MediaType IN ('电影','视频', '音乐', '电视节目', '有声读物', '书籍', '游戏','漫画', '音乐视频', '照片', '混合内容')),
--     LastScanned DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
--     ItemCount INTEGER DEFAULT 0 NOT NULL CHECK(ItemCount >= 0),
--     Cover TEXT
-- );

-- 4. 从备份表恢复数据（不包含 ConfigJson）
-- INSERT INTO MediaLibrary (Id, CreateTime, UpdateTime, Title, PathsJson, Source, MediaType, LastScanned, ItemCount, Cover)
-- SELECT Id, CreateTime, UpdateTime, Title, PathsJson, Source, MediaType, LastScanned, ItemCount, Cover
-- FROM MediaLibrary_backup;

-- 5. 删除备份表
-- DROP TABLE MediaLibrary_backup;

-- ============================================================================
-- 完成
-- ============================================================================

-- 迁移完成！
-- 现在可以在应用程序中使用 ConfigJson 字段存储媒体库配置了。

