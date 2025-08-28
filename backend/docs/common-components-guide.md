# 通用组件使用指南

## 概述

本文档介绍了SmartLIS系统后端通用组件的使用方法，包括统一响应格式、异常处理、参数校验和审计日志等功能。

## 组件列表

### 1. 统一响应格式组件 (ResponseFormatter)

位置：`api/utils/responseFormatter.ts`

#### 功能特性
- 标准化API响应格式
- 支持成功、错误、分页等多种响应类型
- 自动添加时间戳和请求ID
- 支持开发/生产环境差异化处理

#### 基本使用

```typescript
import { ResponseHelper, ResponseCode } from '../utils/responseFormatter.js';

// 成功响应
ResponseHelper.success(res, data, '操作成功');

// 分页响应
const pagination = ResponseHelper.createPaginationMeta(1, 10, 100);
ResponseHelper.paginated(res, dataList, pagination);

// 错误响应
ResponseHelper.error(res, '操作失败', 400, ResponseCode.BAD_REQUEST);

// 验证错误响应
ResponseHelper.validationError(res, errors, '数据验证失败');
```

#### 响应格式示例

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "操作成功",
  "data": {
    "id": "123",
    "name": "示例数据"
  },
  "meta": {
    "timestamp": "2025-08-20T10:30:00.000Z",
    "requestId": "req-123456",
    "version": "1.0.0"
  }
}
```

### 2. 异常处理组件 (EnhancedErrorHandler)

位置：`api/middleware/enhancedErrorHandler.ts`

#### 功能特性
- 自定义业务异常类
- 全局错误处理中间件
- 错误码标准化
- 自动错误日志记录
- 开发/生产环境差异化错误信息

#### 自定义异常类

```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  ConflictError 
} from '../middleware/enhancedErrorHandler.js';

// 抛出验证异常
throw new ValidationError('用户名不能为空', { field: 'username' });

// 抛出认证异常
throw new AuthenticationError('登录已过期');

// 抛出资源未找到异常
throw new NotFoundError('用户不存在');

// 抛出冲突异常
throw new ConflictError('用户名已存在');
```

#### 异步错误处理

```typescript
import { asyncErrorHandler } from '../middleware/enhancedErrorHandler.js';

// 包装异步路由处理函数
const getUserById = asyncErrorHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  ResponseHelper.success(res, user);
});
```

#### 全局错误处理设置

```typescript
import { setupErrorHandling } from '../middleware/enhancedErrorHandler.js';

// 在app.ts中设置
setupErrorHandling(app);
```

### 3. 参数校验组件 (EnhancedValidation)

位置：`api/middleware/enhancedValidation.ts`

#### 功能特性
- 基于Joi的参数验证
- 常用验证规则和自定义验证器
- 支持body、query、params、headers验证
- 中文错误提示
- 数据类型转换和格式化

#### 常用验证器

```typescript
import { CustomValidators, CommonSchemas } from '../middleware/enhancedValidation.js';

// 自定义验证器
CustomValidators.chinesePhone    // 中国手机号
CustomValidators.strongPassword  // 强密码
CustomValidators.uuid           // UUID格式
CustomValidators.chineseIdCard  // 中国身份证

// 常用模式
CommonSchemas.pagination        // 分页查询
CommonSchemas.userRegister      // 用户注册
CommonSchemas.userLogin         // 用户登录
CommonSchemas.uuidParam         // UUID参数
```

#### 验证中间件使用

```typescript
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  CommonSchemas 
} from '../middleware/enhancedValidation.js';

// 验证请求体
router.post('/users', 
  validateBody(CommonSchemas.userRegister),
  controller.createUser
);

// 验证查询参数
router.get('/users',
  validateQuery(CommonSchemas.pagination),
  controller.getUsers
);

// 验证路径参数
router.get('/users/:id',
  validateParams(CommonSchemas.uuidParam),
  controller.getUserById
);
```

#### 自定义验证模式

```typescript
import Joi from 'joi';
import { CustomValidators } from '../middleware/enhancedValidation.js';

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': '产品名称至少2个字符',
    'string.max': '产品名称不能超过100个字符',
    'any.required': '产品名称是必填项'
  }),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('electronics', 'clothing', 'books').required(),
  phone: CustomValidators.chinesePhone.optional()
});
```

### 4. 审计日志组件 (AuditLogger)

位置：`api/middleware/auditLogger.ts`

#### 功能特性
- 操作日志记录
- 用户行为追踪
- 敏感操作审计
- 自动日志存储和查询
- 关键操作通知

#### 审计日志中间件

```typescript
import { auditLogger, userActivityTracker } from '../middleware/auditLogger.js';

// 设置审计日志
router.use(auditLogger({
  includeRequestBody: true,
  includeResponseBody: false,
  sensitiveFields: ['password', 'token', 'secret']
}));

// 用户活动追踪
router.use(userActivityTracker());
```

#### 手动记录审计日志

```typescript
import { AuditLogManager, OperationType, AuditLevel } from '../middleware/auditLogger.js';

const auditManager = AuditLogManager.getInstance();

await auditManager.logAudit({
  timestamp: new Date().toISOString(),
  level: AuditLevel.WARN,
  operationType: OperationType.DELETE,
  resource: 'user',
  userId: req.user.id,
  username: req.user.username,
  action: '删除用户',
  description: `删除用户 ${targetUser.username}`,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  requestMethod: req.method,
  requestUrl: req.originalUrl,
  success: true
});
```

#### 查询审计日志

```typescript
// 获取特定用户的审计日志
const userLogs = auditManager.getAuditLogs({
  userId: 'user-123',
  startDate: new Date('2025-08-01'),
  endDate: new Date('2025-08-31')
});

// 获取特定操作类型的日志
const deleteLogs = auditManager.getAuditLogs({
  operationType: OperationType.DELETE,
  level: AuditLevel.WARN
});
```

## 完整集成示例

### 路由设置示例

```typescript
import express from 'express';
import { 
  ResponseHelper, 
  ResponseFormatter 
} from '../utils/responseFormatter.js';
import { 
  asyncErrorHandler,
  NotFoundError 
} from '../middleware/enhancedErrorHandler.js';
import { 
  validateBody,
  validateParams,
  CommonSchemas 
} from '../middleware/enhancedValidation.js';
import { 
  auditLogger,
  userActivityTracker 
} from '../middleware/auditLogger.js';
import { authenticateToken, requirePermissions } from '../middleware/auth.js';

const router = express.Router();

// 设置请求ID
router.use((req, res, next) => {
  const requestId = req.headers['x-correlation-id'] || 
                   `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const formatter = ResponseFormatter.getInstance();
  formatter.setRequestId(requestId);
  
  next();
});

// 用户活动追踪
router.use(userActivityTracker());

// 审计日志
router.use(auditLogger());

// 用户管理路由
router.get('/users/:id',
  authenticateToken,
  requirePermissions(['user.view']),
  validateParams(CommonSchemas.uuidParam),
  asyncErrorHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    ResponseHelper.success(res, user, '获取用户信息成功');
  })
);

export default router;
```

### 应用程序设置

```typescript
import express from 'express';
import { setupErrorHandling } from '../middleware/enhancedErrorHandler.js';
import userRoutes from '../routes/users.js';

const app = express();

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 业务路由
app.use('/api', userRoutes);

// 错误处理（必须放在最后）
setupErrorHandling(app);

export default app;
```

## 最佳实践

### 1. 错误处理
- 使用自定义异常类而不是直接抛出Error
- 在异步函数中使用asyncErrorHandler包装
- 提供有意义的错误消息和错误码

### 2. 参数验证
- 对所有输入参数进行验证
- 使用预定义的验证模式
- 提供清晰的中文错误提示

### 3. 响应格式
- 统一使用ResponseHelper发送响应
- 设置合适的HTTP状态码和响应码
- 为分页查询提供完整的元数据

### 4. 审计日志
- 对敏感操作启用审计日志
- 过滤敏感字段避免泄露
- 定期清理和归档日志数据

### 5. 性能优化
- 合理设置日志级别
- 避免在高频接口中记录详细日志
- 使用异步方式处理日志记录

## 故障排除

### 常见问题

1. **TypeScript编译错误**
   - 确保正确导入所有依赖
   - 检查类型定义是否匹配

2. **验证失败**
   - 检查验证模式是否正确
   - 确认请求数据格式

3. **审计日志不记录**
   - 检查中间件顺序
   - 确认路径匹配规则

4. **错误处理不生效**
   - 确保错误处理中间件在最后
   - 检查异常类型是否正确

### 调试技巧

1. 启用详细日志
2. 使用开发环境配置
3. 检查网络请求和响应
4. 查看审计日志记录

## 更新日志

- **v1.0.0** (2025-08-20)
  - 初始版本发布
  - 包含所有核心通用组件
  - 完整的文档和示例