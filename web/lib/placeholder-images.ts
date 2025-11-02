// 占位图片生成工具
export const generatePlaceholderImage = (width: number, height: number, seed: number = 1, category: string = 'abstract') => {
    // 使用 Lorem Picsum 作为可靠的占位图片服务
    return `https://picsum.photos/${width}/${height}?random=${seed}`;
};

// 预定义的图片集合
export const placeholderImages = {
    // 游戏相关图片 (16:9 比例)
    games: [
        "https://picsum.photos/800/450?random=1001",
        "https://picsum.photos/800/450?random=1002", 
        "https://picsum.photos/800/450?random=1003",
        "https://picsum.photos/800/450?random=1004",
        "https://picsum.photos/800/450?random=1005",
        "https://picsum.photos/800/450?random=1006",
        "https://picsum.photos/800/450?random=1007",
        "https://picsum.photos/800/450?random=1008",
        "https://picsum.photos/800/450?random=1009",
        "https://picsum.photos/800/450?random=1010"
    ],
    
    // 动漫封面 (3:4 比例)
    animes: [
        "https://picsum.photos/300/400?random=2001",
        "https://picsum.photos/300/400?random=2002",
        "https://picsum.photos/300/400?random=2003", 
        "https://picsum.photos/300/400?random=2004",
        "https://picsum.photos/300/400?random=2005",
        "https://picsum.photos/300/400?random=2006",
        "https://picsum.photos/300/400?random=2007",
        "https://picsum.photos/300/400?random=2008",
        "https://picsum.photos/300/400?random=2009",
        "https://picsum.photos/300/400?random=2010"
    ],
    
    // 电影海报 (2:3 比例)
    movies: [
        "https://picsum.photos/400/600?random=3001",
        "https://picsum.photos/400/600?random=3002",
        "https://picsum.photos/400/600?random=3003",
        "https://picsum.photos/400/600?random=3004", 
        "https://picsum.photos/400/600?random=3005",
        "https://picsum.photos/400/600?random=3006",
        "https://picsum.photos/400/600?random=3007",
        "https://picsum.photos/400/600?random=3008",
        "https://picsum.photos/400/600?random=3009",
        "https://picsum.photos/400/600?random=3010"
    ],
    
    // 视频缩略图 (16:9 比例)
    videos: [
        "https://picsum.photos/800/450?random=4001",
        "https://picsum.photos/800/450?random=4002",
        "https://picsum.photos/800/450?random=4003",
        "https://picsum.photos/800/450?random=4004",
        "https://picsum.photos/800/450?random=4005",
        "https://picsum.photos/800/450?random=4006",
        "https://picsum.photos/800/450?random=4007",
        "https://picsum.photos/800/450?random=4008",
        "https://picsum.photos/800/450?random=4009",
        "https://picsum.photos/800/450?random=4010"
    ],
    
    // 漫画封面 (3:4 比例)
    mangas: [
        "https://picsum.photos/300/400?random=5001",
        "https://picsum.photos/300/400?random=5002",
        "https://picsum.photos/300/400?random=5003",
        "https://picsum.photos/300/400?random=5004",
        "https://picsum.photos/300/400?random=5005",
        "https://picsum.photos/300/400?random=5006",
        "https://picsum.photos/300/400?random=5007",
        "https://picsum.photos/300/400?random=5008",
        "https://picsum.photos/300/400?random=5009",
        "https://picsum.photos/300/400?random=5010"
    ],
    
    // 用户头像 (1:1 比例)
    avatars: [
        "https://picsum.photos/100/100?random=6001",
        "https://picsum.photos/100/100?random=6002",
        "https://picsum.photos/100/100?random=6003",
        "https://picsum.photos/100/100?random=6004",
        "https://picsum.photos/100/100?random=6005",
        "https://picsum.photos/100/100?random=6006",
        "https://picsum.photos/100/100?random=6007",
        "https://picsum.photos/100/100?random=6008",
        "https://picsum.photos/100/100?random=6009",
        "https://picsum.photos/100/100?random=6010"
    ],
    
    // 横幅图片 (21:9 比例)
    banners: [
        "https://picsum.photos/1200/514?random=7001",
        "https://picsum.photos/1200/514?random=7002",
        "https://picsum.photos/1200/514?random=7003",
        "https://picsum.photos/1200/514?random=7004",
        "https://picsum.photos/1200/514?random=7005",
        "https://picsum.photos/1200/514?random=7006",
        "https://picsum.photos/1200/514?random=7007",
        "https://picsum.photos/1200/514?random=7008",
        "https://picsum.photos/1200/514?random=7009",
        "https://picsum.photos/1200/514?random=7010"
    ]
};

// 根据索引获取图片
export const getPlaceholderImage = (category: keyof typeof placeholderImages, index: number = 0) => {
    const images = placeholderImages[category];
    return images[index % images.length];
};

// 随机获取图片
export const getRandomPlaceholderImage = (category: keyof typeof placeholderImages) => {
    const images = placeholderImages[category];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};
