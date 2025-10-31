-- 添加 ImagePaths 字段到 Manga 表
-- 存储图片路径列表（JSON 格式）
ALTER TABLE Manga ADD COLUMN ImagePaths TEXT;

-- 添加 ImagePaths 字段到 MangaChapter 表
-- 存储章节图片路径列表（JSON 格式）
ALTER TABLE MangaChapter ADD COLUMN ImagePaths TEXT;

