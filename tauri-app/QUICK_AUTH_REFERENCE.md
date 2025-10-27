# 认证系统快速参考

## 核心原则

✅ **默认所有新页面都是受保护的**  
✅ **只有 `PUBLIC_ROUTES` 中的页面是公开的**  
✅ **无需额外配置，新页面自动受保护**

## 快速查询

### 1. 创建新的受保护页面

```typescript
// web/app/(main)/my-page/page.tsx
export default function MyPage() {
  return <div>自动受保护，需要 Token</div>;
}
```

**无需任何配置！** 新页面会自动受保护。

### 2. 创建新的公开页面

```typescript
// 1. 创建页面
// web/app/about/page.tsx
export default function AboutPage() {
  return <div>公开页面</div>;
}

// 2. 在 middleware.ts 中添加到 PUBLIC_ROUTES
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/about', // 添加这一行
];
```

### 3. 在页面中使用认证信息

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>已登录</p>
          <button onClick={logout}>登出</button>
        </>
      ) : (
        <p>未登录</p>
      )}
    </div>
  );
}
```

### 4. 在登录页面处理登录

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const { handleLoginSuccess } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    handleLoginSuccess(response.token);
  };

  return (
    // 登录表单...
  );
}
```

### 5. 在页面中添加额外的客户端保护

```typescript
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>额外受保护的内容</div>
    </ProtectedRoute>
  );
}
```

## 路由保护流程

```
用户访问页面
    ↓
中间件检查是否是公开路由
    ↓
是公开路由? → 允许访问
    ↓
不是公开路由? → 检查 Token
    ↓
有 Token? → 允许访问
    ↓
没有 Token? → 重定向到 /login?from=/original-path
```

## 常见场景

### 场景 1: 创建新的用户页面

```typescript
// web/app/(main)/user/profile/page.tsx
export default function ProfilePage() {
  return <div>用户资料页面</div>;
}
```

✅ 自动受保护，用户必须登录才能访问

### 场景 2: 创建公开的关于页面

```typescript
// 1. 创建页面
// web/app/about/page.tsx
export default function AboutPage() {
  return <div>关于我们</div>;
}

// 2. 在 middleware.ts 中添加
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/about', // ← 添加这一行
];
```

✅ 任何人都可以访问，无需登录

### 场景 3: 创建需要特殊权限的页面

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 这里可以添加额外的权限检查
    // 例如检查用户是否是管理员
  }, []);

  if (isLoading) return <div>加载中...</div>;

  return <div>管理员页面</div>;
}
```

## 文件位置

| 文件 | 位置 | 说明 |
|------|------|------|
| 中间件 | `web/middleware.ts` | 服务端路由保护 |
| 认证 Hook | `web/hooks/useAuth.ts` | 客户端认证状态管理 |
| 受保护组件 | `web/components/ProtectedRoute.tsx` | 客户端路由保护 |
| 完整文档 | `web/AUTHENTICATION_GUIDE.md` | 详细文档 |

## 修改 PUBLIC_ROUTES

编辑 `web/middleware.ts`:

```typescript
const PUBLIC_ROUTES = [
  '/login',           // 登录页面
  '/register',        // 注册页面
  '/forgot-password', // 忘记密码页面
  '/about',           // 添加新的公开页面
  '/privacy-policy',  // 添加新的公开页面
];
```

## Token 管理

Token 现在存储在 **Cookie** 中（而不是 localStorage），这样中间件可以读取它。

| 操作 | 代码 |
|------|------|
| 获取 Token | `http.getToken()` 或从 Cookie 读取 |
| 保存 Token | `http.setToken(token, true)` - 7天过期 |
| 保存 Token | `http.setToken(token, false)` - 会话 Cookie |
| 删除 Token | `http.clearToken()` |
| 检查 Token | `useAuth().checkAuth()` |

**为什么使用 Cookie？**
- ✅ 中间件可以读取 Cookie
- ✅ 自动在每个请求中发送
- ✅ 支持过期时间设置

## 调试

### 检查中间件是否工作

1. 打开浏览器开发者工具（F12）
2. 访问受保护的页面（如 `/`）
3. 查看 Network 标签
4. 应该看到重定向到 `/login?from=/`

### 检查 Token 是否保存

```javascript
// 在浏览器控制台运行
console.log(document.cookie);

// 或者获取具体的 token
const cookies = document.cookie.split(';');
for (const cookie of cookies) {
  const [name, value] = cookie.trim().split('=');
  if (name === 'token') {
    console.log('Token:', decodeURIComponent(value));
  }
}
```

### 检查认证状态

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function DebugPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <p>已认证: {isAuthenticated ? '是' : '否'}</p>
      <p>加载中: {isLoading ? '是' : '否'}</p>
    </div>
  );
}
```

## 完整的认证流程

```
1. 用户访问受保护的路由 (如 /)
   ↓
2. 中间件检查 Cookie 中是否有 token
   ↓
3. 没有 token → 重定向到 /login?from=/
   ↓
4. 用户在登录页面输入凭证
   ↓
5. 调用 api.auth.login()
   ↓
6. 后端验证凭证并返回 token
   ↓
7. HTTP 客户端自动将 token 保存到 Cookie
   ↓
8. 登录成功，调用 handleLoginSuccess()
   ↓
9. 重定向回原始页面 (/)
   ↓
10. 中间件检查 Cookie，发现有 token，允许访问
```

## 总结

✅ **Token 存储在 Cookie** - 中间件可以读取
✅ **新页面默认受保护** - 无需配置
✅ **添加公开页面** - 只需在 `PUBLIC_ROUTES` 中添加
✅ **使用认证信息** - 使用 `useAuth` Hook
✅ **处理登录** - 使用 `handleLoginSuccess()`
✅ **额外保护** - 使用 `ProtectedRoute` 组件

