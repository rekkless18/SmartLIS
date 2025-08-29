/**
 * 通用组件集成示例
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 * 描述：展示如何在现有系统中集成和使用所有通用组件
 */

import express, { Application, Request, Response } from 'express';
import Joi from 'joi';
import { 
  ResponseHelper, 
  ResponseFormatter, 
  ResponseCode, 
  ErrorType 
} from '../utils/responseFormatter.js';
import {
  BusinessError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler
} from '../middleware/enhancedErrorHandler.js';
import {
  validateBody,
  validateQuery,
  validateParams,
  CommonSchemas,
  CustomValidators,
  ValidationTarget,
  Validator
} from '../middleware/enhancedValidation.js';
import {
  auditLogger,
  userActivityTracker,
  AuditLogManager,
  OperationType,
  AuditLevel
} from '../middleware/auditLogger.js';
import { authenticateToken, requirePermissions } from '../middleware/auth.js';
import logger from '../config/logger.js';

/**
 * 示例用户接口
 */
interface ExampleUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 示例用户服务类
 */
class ExampleUserService {
  private users: ExampleUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  /**
   * 获取所有用户（分页）
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: ExampleUser[];
    total: number;
  }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      users: this.users.slice(startIndex, endIndex),
      total: this.users.length
    };
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<ExampleUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  /**
   * 创建用户
   */
  async createUser(userData: Partial<ExampleUser>): Promise<ExampleUser> {
    // 检查用户名是否已存在
    const existingUser = this.users.find(user => user.username === userData.username);
    if (existingUser) {
      throw new ValidationError('用户名已存在');
    }

    const newUser: ExampleUser = {
      id: (this.users.length + 1).toString(),
      username: userData.username!,
      email: userData.email!,
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    return newUser;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, userData: Partial<ExampleUser>): Promise<ExampleUser> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundError('用户不存在');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundError('用户不存在');
    }

    this.users.splice(userIndex, 1);
  }
}

/**
 * 示例控制器类
 */
class ExampleUserController {
  private userService = new ExampleUserService();

  /**
   * 获取用户列表
   */
  getUsers = asyncErrorHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await this.userService.getUsers(
      Number(page) || 1,
      Number(limit) || 10
    );

    const pagination = ResponseHelper.createPaginationMeta(
      Number(page) || 1,
      Number(limit) || 10,
      result.total
    );

    ResponseHelper.paginated(res, result.users, pagination, '获取用户列表成功');
  });

  /**
   * 根据ID获取用户
   */
  getUserById = asyncErrorHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    ResponseHelper.success(res, user, '获取用户信息成功');
  });

  /**
   * 创建用户
   */
  createUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    const newUser = await this.userService.createUser(userData);

    ResponseHelper.success(
      res,
      newUser,
      '创建用户成功',
      201,
      ResponseCode.CREATED
    );
  });

  /**
   * 更新用户
   */
  updateUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await this.userService.updateUser(id, userData);

    ResponseHelper.success(
      res,
      updatedUser,
      '更新用户成功',
      200,
      ResponseCode.UPDATED
    );
  });

  /**
   * 删除用户
   */
  deleteUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.userService.deleteUser(id);

    ResponseHelper.success(
      res,
      null,
      '删除用户成功',
      200,
      ResponseCode.DELETED
    );
  });
}

/**
 * 自定义验证模式示例
 */
const createUserSchema = Joi.object({
  username: CustomValidators.username.required(),
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱是必填项'
  }),
  role: Joi.string().valid('admin', 'user', 'manager').default('user'),
  phone: CustomValidators.chinesePhone.optional()
});

const updateUserSchema = Joi.object({
  username: CustomValidators.username.optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'user', 'manager').optional(),
  phone: CustomValidators.chinesePhone.optional()
});

/**
 * 设置示例路由
 */
export function setupExampleRoutes(app: Application): void {
  const controller = new ExampleUserController();
  const router = express.Router();

  // 设置请求ID中间件（用于审计日志关联）
  router.use((req, res, next) => {
    if (!req.headers['x-correlation-id']) {
      req.headers['x-correlation-id'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
  });

  // 设置响应格式化器的请求ID
  router.use((req, res, next) => {
    const formatter = ResponseFormatter.getInstance();
    formatter.setRequestId(req.headers['x-correlation-id'] as string);
    next();
  });

  // 用户活动追踪
  router.use(userActivityTracker());

  // 审计日志记录
  router.use(auditLogger({
    includeRequestBody: true,
    includeResponseBody: false,
    sensitiveFields: ['password', 'token', 'secret']
  }));

  // 用户管理路由
  router.get('/users',
    authenticateToken,
    requirePermissions(['user.view']),
    validateQuery(CommonSchemas.pagination),
    controller.getUsers
  );

  router.get('/users/:id',
    authenticateToken,
    requirePermissions(['user.view']),
    validateParams(CommonSchemas.uuidParam),
    controller.getUserById
  );

  router.post('/users',
    authenticateToken,
    requirePermissions(['user.create']),
    validateBody(createUserSchema),
    controller.createUser
  );

  router.put('/users/:id',
    authenticateToken,
    requirePermissions(['user.update']),
    validateParams(CommonSchemas.uuidParam),
    validateBody(updateUserSchema),
    controller.updateUser
  );

  router.delete('/users/:id',
    authenticateToken,
    requirePermissions(['user.delete']),
    validateParams(CommonSchemas.uuidParam),
    controller.deleteUser
  );

  // 挂载路由
  app.use('/api/example', router);
}

/**
 * 测试通用组件功能
 */
export async function testCommonComponents(): Promise<void> {
  logger.info('开始测试通用组件...');

  try {
    // 测试响应格式化器
    logger.info('测试响应格式化器...');
    const formatter = ResponseFormatter.getInstance();
    formatter.setRequestId('test-request-123');
    
    const successResponse = formatter.success({ message: 'Hello World' }, '操作成功');
    logger.info('成功响应格式:', successResponse);

    const errorResponse = formatter.error(
      '测试错误',
      ResponseCode.VALIDATION_ERROR,
      ErrorType.VALIDATION,
      { field: 'username', message: '用户名不能为空' }
    );
    logger.info('错误响应格式:', errorResponse);

    // 测试验证器
    logger.info('测试参数验证器...');
    const validationResult = Validator.validate(
      CommonSchemas.userLogin,
      { username: 'testuser', password: 'password123' }
    );
    logger.info('验证结果:', validationResult);

    // 测试审计日志管理器
    logger.info('测试审计日志管理器...');
    const auditManager = AuditLogManager.getInstance();
    
    await auditManager.logAudit({
      timestamp: new Date().toISOString(),
      level: AuditLevel.INFO,
      operationType: OperationType.CREATE,
      resource: 'user',
      userId: 'test-user-123',
      username: 'testuser',
      userRole: 'admin',
      action: '创建用户',
      description: '测试创建用户操作',
      ipAddress: process.env.NODE_ENV === 'production' ? '47.106.198.192' : '127.0.0.1',
      userAgent: 'Test Agent',
      requestMethod: 'POST',
      requestUrl: '/api/users',
      success: true
    });

    // 获取审计日志
    const auditLogs = auditManager.getAuditLogs({
      userId: 'test-user-123',
      operationType: OperationType.CREATE
    });
    logger.info('审计日志查询结果:', auditLogs);

    // 测试自定义异常
    logger.info('测试自定义异常...');
    try {
      throw new ValidationError('测试验证异常', {
        field: 'email',
        message: '邮箱格式不正确'
      });
    } catch (error) {
      logger.info('捕获到验证异常:', {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    }

    logger.info('通用组件测试完成！');
  } catch (error) {
    logger.error('通用组件测试失败:', error);
    throw error;
  }
}

/**
 * 设置完整的应用程序示例
 */
export function setupExampleApp(): Application {
  const app = express();

  // 基础中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 设置示例路由
  setupExampleRoutes(app);

  // 404处理
  app.use(notFoundHandler);

  // 全局错误处理
  app.use(globalErrorHandler);

  return app;
}

/**
 * 默认导出
 */
export default {
  ExampleUserService,
  ExampleUserController,
  setupExampleRoutes,
  testCommonComponents,
  setupExampleApp
};