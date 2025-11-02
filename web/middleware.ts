import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 中间件 - 用于路由保护和认证检查
 *
 * 功能：
 * 1. 检查用户是否有有效的 token
 * 2. 如果没有 token，强制跳转到登录页面
 * 3. 允许访问公开页面（不需要 token）
 * 4. 其他所有页面都需要 token（默认受保护）
 *
 * 策略：白名单制 - 只有明确列出的路由是公开的，其他都需要认证
 */

// 定义不需要认证的路由（公开路由 - 白名单）
// 只有这些路由可以在没有 token 的情况下访问
// 新建的页面默认都是受保护的，需要 token 才能访问
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/.well-known',
];

/**
 * 检查路由是否是公开的（白名单）
 * 只有在 PUBLIC_ROUTES 中的路由才是公开的
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * 从请求中获取 token
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // 1. 从 Cookie 中获取 token
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. 从 Authorization header 中获取 token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * 中间件主函数
 *
 * 策略：
 * 1. 如果是公开路由，允许访问
 * 2. 如果不是公开路由，检查 token
 * 3. 没有 token，重定向到登录页面
 * 4. 有 token，允许访问
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. 检查是否是公开路由
  if (isPublicRoute(pathname)) {
    // 公开路由允许访问（不需要 token）
    return NextResponse.next();
  }

  // 2. 所有其他路由都需要 token（默认受保护）
  // 获取 token
  const token = getTokenFromRequest(request);

  // 如果没有 token，重定向到登录页面
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // 保存原始 URL，登录后可以重定向回来
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 有 token，允许访问
  return NextResponse.next();
}

/**
 * 配置中间件匹配的路由
 * matcher 定义了中间件应该运行的路由
 */
export const config = {
  matcher: [
    // 匹配所有路由，除了以下特殊路由
    '/((?!_next/static|_next/image|favicon.ico|.well-known).*)',
  ],
};

