# 认证授权 API 文档

## 概述

本文档描述了SmartLis系统的认证授权相关API接口，包括用户注册、登录、登出、权限验证等功能。

**基础URL**: `/api/auth`

## 认证方式

系统使用JWT（JSON Web Token）进行身份认证。在需要认证的接口中，需要在请求头中包含：

```
Authorization: Bearer <token>
```

## API 接口

### 1. 用户注册

**接口地址**: `POST /api/auth/register`

**描述**: 注册新用户账号

**请求参数**:
```json
{
  "username": "string",     // 用户名，必填，3-20字符
  "email": "string",        // 邮箱，必填，有效邮箱格式
  "password": "string",     // 密码，必填，8-50字符
  "realName": "string",    // 真实姓名，必填
  "phone": "string",       // 手机号，可选
  "department": "string",  // 部门，可选
  "position": "string"     // 职位，可选
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "realName": "测试用户",
    "phone": "13800138000",
    "department": "研发部",
    "position": "工程师",
    "status": "active",
    "createdAt": "2025-08-20T10:00:00.000Z"
  }
}
```

### 2. 用户登录

**接口地址**: `POST /api/auth/login`

**描述**: 用户登录获取访问令牌

**请求参数**:
```json
{
  "username": "string",  // 用户名，必填
  "password": "string"   // 密码，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "realName": "测试用户",
      "phone": "13800138000",
      "department": "研发部",
      "position": "工程师",
      "avatar": "",
      "roles": ["admin"],
      "permissions": [
        "submission:view",
        "sample:view",
        "experiment:view"
      ],
      "createdAt": "2025-08-20T10:00:00.000Z",
      "updatedAt": "2025-08-20T10:00:00.000Z"
    },
    "expiresIn": "7d"
  }
}
```

### 3. 用户登出

**接口地址**: `POST /api/auth/logout`

**描述**: 用户登出（需要认证）

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "message": "登出成功",
  "data": null
}
```

### 4. 获取当前用户信息

**接口地址**: `GET /api/auth/me`

**描述**: 获取当前登录用户的详细信息（需要认证）

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "realName": "测试用户",
    "phone": "13800138000",
    "department": "研发部",
    "position": "工程师",
    "avatar": "",
    "roles": ["admin"],
    "permissions": [
      "submission:view",
      "sample:view",
      "experiment:view"
    ],
    "createdAt": "2025-08-20T10:00:00.000Z",
    "updatedAt": "2025-08-20T10:00:00.000Z"
  }
}
```

### 5. 刷新令牌

**接口地址**: `POST /api/auth/refresh`

**描述**: 刷新访问令牌（需要认证）

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

## 权限系统

### 角色定义

| 角色 | 代码 | 描述 |
|------|------|------|
| 管理员 | admin | 拥有系统所有权限 |
| 实验室管理员 | lab_manager | 实验室管理权限 |
| 技术员 | technician | 样本处理和实验执行权限 |
| 分析员 | analyst | 实验分析和报告权限 |
| 查看者 | viewer | 只读权限 |

### 权限模块

| 模块 | 权限代码前缀 | 描述 |
|------|-------------|------|
| 送检管理 | submission: | 送检单的增删改查和审批 |
| 样本管理 | sample: | 样本的接收、存储、转移、销毁 |
| 实验管理 | experiment: | 实验的创建、执行、管理 |
| 报告管理 | report: | 报告的生成、编辑、发布 |
| 实验室管理 | lab: | 实验室配置和管理 |
| 环境管理 | environment: | 环境监控和配置 |
| 用户管理 | user: | 用户账号和角色管理 |
| 系统设置 | system: | 系统配置和维护 |

### 中间件使用

#### 1. 认证中间件

```javascript
import { authenticateToken } from '../middleware/auth.js';

// 需要登录的路由
router.get('/protected', authenticateToken, handler);
```

#### 2. 角色权限中间件

```javascript
import { requireRoles } from '../middleware/auth.js';

// 需要管理员角色
router.get('/admin-only', authenticateToken, requireRoles(['admin']), handler);
```

#### 3. 具体权限中间件

```javascript
import { requirePermissions } from '../middleware/auth.js';

// 需要样本查看权限
router.get('/samples', authenticateToken, requirePermissions(['sample:view']), handler);
```

## 错误码

| 状态码 | 错误类型 | 描述 |
|--------|----------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或令牌无效 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 用户不存在 |
| 409 | Conflict | 用户名或邮箱已存在 |
| 500 | Internal Server Error | 服务器内部错误 |

## 安全注意事项

1. **密码安全**: 密码使用bcrypt进行加密存储
2. **令牌安全**: JWT令牌包含过期时间，默认7天
3. **HTTPS**: 生产环境必须使用HTTPS传输
4. **CORS**: 已配置跨域访问控制
5. **日志记录**: 所有认证操作都会记录日志
6. **权限检查**: 每个需要权限的接口都会进行权限验证

## 更新日志

- **2025-08-20**: 初始版本，包含基础认证功能
- **2025-08-20**: 添加权限拦截器和前端数据格式对接