# 认证系统指南

## 概述

项目已实现完整的认证系统，包括：
- ✅ 服务端中间件路由保护
- ✅ 客户端认证 Hook
- ✅ 受保护的路由组件
- ✅ Token 管理

## 工作流程

```
用户访问受保护的路由
    ↓
中间件检查 Token
    ↓
有 Token? → 允许访问
    ↓
无 Token? → 重定向到 /login?from=/original-path
    ↓
用户登录
    ↓
API 返回 Token
    ↓
Token 保存到 localStorage/sessionStorage
    ↓
重定向回原始页面
```

## 文件说明

### 1. `middleware.ts` - 服务端中间件
**位置**: `web/middleware.ts`

**功能**:
- 在服务端检查所有请求
- 验证用户是否有有效的 Token
- 如果没有 Token，重定向到登录页面
- 保存原始 URL，登录后可以重定向回来

**策略：白名单制**
- ✅ 只有 `PUBLIC_ROUTES` 中的路由是公开的（不需要 Token）
- ✅ 所有其他路由都是受保护的（需要 Token）
- ✅ 新建的页面默认都是受保护的

**配置**:
```typescript
// 公开路由（白名单 - 不需要 Token）
// 只有这些路由可以在没有 token 的情况下访问
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
];

// 所有其他路由都需要 Token（默认受保护）
// 新建的页面会自动受保护，无需额外配置
```

### 2. `useAuth.ts` - 认证 Hook
**位置**: `web/hooks/useAuth.ts`

**功能**:
- 检查用户是否已登录
- 管理登录/登出状态
- 处理登录成功后的重定向

**使用方式**:
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { isAuthenticated, isLoading, logout, handleLoginSuccess } = useAuth();

  if (isLoading) return <div>加载中...</div>;

  if (!isAuthenticated) {
    return <div>未登录</div>;
  }

  return (
    <div>
      <p>已登录</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 3. `ProtectedRoute.tsx` - 受保护的路由组件
**位置**: `web/components/ProtectedRoute.tsx`

**功能**:
- 在客户端保护路由
- 检查 Token 是否存在
- 如果没有 Token，重定向到登录页面

**使用方式**:
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>只有登录用户才能看到这个内容</div>
    </ProtectedRoute>
  );
}
```

## Token 管理

### 保存 Token
Token 在登录成功后由 `http.ts` 自动保存到 **Cookie**：

```typescript
// 在 web/lib/http.ts 中
http.setToken(token, true); // true 表示持久化保存（7天过期）
// 或
http.setToken(token, false); // false 表示会话 Cookie（浏览器关闭时删除）
```

**为什么使用 Cookie？**
- ✅ 中间件可以读取 Cookie（无法读取 localStorage）
- ✅ 自动在每个请求中发送
- ✅ 支持 HttpOnly 标志（防止 XSS 攻击）
- ✅ 支持过期时间设置

### 获取 Token
```typescript
// 从 Cookie 获取
const cookies = document.cookie.split(';');
for (const cookie of cookies) {
  const [name, value] = cookie.trim().split('=');
  if (name === 'token') {
    return decodeURIComponent(value);
  }
}
```

### 删除 Token
```typescript
// 登出时删除 Token
document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
```

## 登录流程

1. **用户访问受保护的路由**
   - 中间件检查 Token
   - 如果没有 Token，重定向到 `/login?from=/original-path`

2. **用户在登录页面输入凭证**
   - 调用 `api.auth.login()`
   - 后端验证凭证并返回 Token

3. **前端处理登录响应**
   - 验证响应数据
   - 保存 Token 到 localStorage/sessionStorage
   - 调用 `handleLoginSuccess(token)`

4. **重定向回原始页面**
   - 如果有 `from` 参数，重定向到原始页面
   - 否则重定向到首页 `/`

## 登出流程

1. **用户点击登出按钮**
   ```typescript
   const { logout } = useAuth();
   logout(); // 删除 Token 并重定向到登录页面
   ```

2. **清除 Token**
   - 从 localStorage/sessionStorage 删除 Token
   - 更新认证状态

3. **重定向到登录页面**
   - 用户被重定向到 `/login`

## 添加新的路由

### 新建的页面默认是受保护的 ✅

当你创建新的页面时，**无需任何配置**，新页面会自动受保护：

```typescript
// 创建新页面：web/app/(main)/my-new-page/page.tsx
export default function MyNewPage() {
  return <div>这个页面自动受保护，需要 Token 才能访问</div>;
}
```

用户访问 `/my-new-page` 时：
- 如果有 Token → 允许访问
- 如果没有 Token → 重定向到 `/login?from=/my-new-page`

### 添加新的公开路由

如果你想创建一个**不需要 Token** 的公开页面，需要在 `middleware.ts` 中添加到 `PUBLIC_ROUTES`:

```typescript
// middleware.ts
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/about',        // 添加新的公开路由
  '/privacy-policy', // 添加新的公开路由
];
```

现在 `/about` 和 `/privacy-policy` 可以在没有 Token 的情况下访问。

### 使用 ProtectedRoute 组件（可选）

如果你想在客户端额外保护某个页面，可以使用 `ProtectedRoute` 组件：

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>这个内容在客户端也会被保护</div>
    </ProtectedRoute>
  );
}
```

**注意**: 中间件已经在服务端保护了路由，`ProtectedRoute` 组件是额外的客户端保护。

## 常见问题

### Q: Token 存储在哪里？
A: Token 存储在 `localStorage` 或 `sessionStorage` 中。
- `localStorage`: 持久化存储，关闭浏览器后仍然存在
- `sessionStorage`: 会话存储，关闭浏览器后删除

### Q: 如何在 API 请求中自动添加 Token？
A: HTTP 客户端会自动在请求头中添加 Token：
```typescript
// 在 web/lib/http.ts 中
config.headers.Authorization = `Bearer ${token}`;
```

### Q: 如何处理 Token 过期？
A: 当 Token 过期时，后端返回 401 错误，HTTP 客户端会：
1. 删除本地 Token
2. 显示错误提示
3. 用户需要重新登录

### Q: 如何在登录后重定向回原始页面？
A: 中间件会自动保存原始 URL 到 `from` 参数，登录成功后会自动重定向。

## 测试认证系统

1. **测试未登录访问受保护路由**
   - 访问 `http://localhost:3001/`
   - 应该被重定向到 `/login?from=/`

2. **测试登录**
   - 在登录页面输入凭证
   - 点击登录按钮
   - 应该被重定向回首页

3. **测试登出**
   - 登录后访问首页
   - 点击登出按钮
   - 应该被重定向到登录页面

## 安全建议

1. **使用 HTTPS**: 在生产环境中始终使用 HTTPS
2. **设置 Token 过期时间**: 后端应该设置合理的 Token 过期时间
3. **使用 HttpOnly Cookie**: 考虑使用 HttpOnly Cookie 存储 Token（防止 XSS 攻击）
4. **CSRF 保护**: 实现 CSRF 令牌保护
5. **刷新 Token**: 实现刷新 Token 机制，定期更新 Token

