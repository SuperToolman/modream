/** @type {import('next').NextConfig} */
const nextConfig = {
    // 移除静态导出以支持动态路由和客户端组件
    // output: 'export',
    trailingSlash: true,
    images: {
        // 启用图片优化以改进 LCP 性能
        unoptimized: false,
        // 允许外部图片域名
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'heroui.com',
                port: '',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'i0.hdslb.com',
                port: '',
                pathname: '/bfs/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/api/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8080',
                pathname: '/api/**',
            }
        ],
        // 图片优化配置
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },
    // 配置静态资源
    assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
    // Turbopack 配置 - 允许视频文件作为静态资源
    turbopack: {
        resolveAlias: {
            '@': './src',
        },
    },
};

export default nextConfig;
