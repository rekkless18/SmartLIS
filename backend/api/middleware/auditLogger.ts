/**
 * 审计日志记录中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 * 描述：提供操作日志记录、用户行为追踪和敏感操作审计功能
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';
import { AuthenticatedRequest } from './auth.js';

/**
 * 审计日志级别枚举
 */
export enum AuditLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 操作类型枚举
 */
export enum OperationType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  CANCEL = 'CANCEL'
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  id?: string;
  timestamp: string;
  level: AuditLevel;
  operationType: OperationType;
  resource: string;
  resourceId?: string;
  userId?: string;
  username?: string;
  userRole?: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestUrl: string;
  requestHeaders?: Record<string, any>;
  requestBody?: any;
  responseStatus?: number;
  responseTime?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  correlationId?: string;
}

/**
 * 敏感操作配置接口
 */
export interface SensitiveOperationConfig {
  path: string;
  method: string;
  operationType: OperationType;
  resource: string;
  description: string;
  level: AuditLevel;
  requiresApproval?: boolean;
  notificationRequired?: boolean;
}

/**
 * 审计日志管理器类
 */
export class AuditLogManager {
  private static instance: AuditLogManager;
  private sensitiveOperations: Map<string, SensitiveOperationConfig> = new Map();
  private auditLogs: AuditLog[] = [];
  private maxLogsInMemory: number = 1000;

  private constructor() {
    this.initializeSensitiveOperations();
  }

  /**
   * 获取单例实例
   * @returns AuditLogManager实例
   */
  public static getInstance(): AuditLogManager {
    if (!AuditLogManager.instance) {
      AuditLogManager.instance = new AuditLogManager();
    }
    return AuditLogManager.instance;
  }

  /**
   * 初始化敏感操作配置
   */
  private initializeSensitiveOperations(): void {
    const sensitiveOps: SensitiveOperationConfig[] = [
      // 用户管理相关
      {
        path: '/api/users',
        method: 'POST',
        operationType: OperationType.CREATE,
        resource: 'user',
        description: '创建用户',
        level: AuditLevel.INFO
      },
      {
        path: '/api/users/:id',
        method: 'PUT',
        operationType: OperationType.UPDATE,
        resource: 'user',
        description: '更新用户信息',
        level: AuditLevel.INFO
      },
      {
        path: '/api/users/:id',
        method: 'DELETE',
        operationType: OperationType.DELETE,
        resource: 'user',
        description: '删除用户',
        level: AuditLevel.WARN,
        requiresApproval: true
      },
      // 角色权限相关
      {
        path: '/api/roles',
        method: 'POST',
        operationType: OperationType.CREATE,
        resource: 'role',
        description: '创建角色',
        level: AuditLevel.WARN
      },
      {
        path: '/api/roles/:id/permissions',
        method: 'PUT',
        operationType: OperationType.UPDATE,
        resource: 'role_permission',
        description: '修改角色权限',
        level: AuditLevel.CRITICAL,
        requiresApproval: true,
        notificationRequired: true
      },
      // 系统配置相关
      {
        path: '/api/system/config',
        method: 'PUT',
        operationType: OperationType.UPDATE,
        resource: 'system_config',
        description: '修改系统配置',
        level: AuditLevel.CRITICAL,
        requiresApproval: true
      },
      // 数据导出相关
      {
        path: '/api/export/*',
        method: 'GET',
        operationType: OperationType.EXPORT,
        resource: 'data',
        description: '数据导出',
        level: AuditLevel.WARN
      },
      // 文件上传相关
      {
        path: '/api/upload',
        method: 'POST',
        operationType: OperationType.UPLOAD,
        resource: 'file',
        description: '文件上传',
        level: AuditLevel.INFO
      }
    ];

    sensitiveOps.forEach(op => {
      const key = `${op.method}:${op.path}`;
      this.sensitiveOperations.set(key, op);
    });
  }

  /**
   * 添加敏感操作配置
   * @param config 敏感操作配置
   */
  public addSensitiveOperation(config: SensitiveOperationConfig): void {
    const key = `${config.method}:${config.path}`;
    this.sensitiveOperations.set(key, config);
  }

  /**
   * 检查是否为敏感操作
   * @param method HTTP方法
   * @param path 请求路径
   * @returns 敏感操作配置或null
   */
  public getSensitiveOperation(method: string, path: string): SensitiveOperationConfig | null {
    const exactKey = `${method.toUpperCase()}:${path}`;
    
    // 精确匹配
    if (this.sensitiveOperations.has(exactKey)) {
      return this.sensitiveOperations.get(exactKey)!;
    }

    // 模式匹配
    for (const [key, config] of this.sensitiveOperations.entries()) {
      const [configMethod, configPath] = key.split(':');
      if (configMethod === method.toUpperCase() && this.matchPath(configPath, path)) {
        return config;
      }
    }

    return null;
  }

  /**
   * 路径匹配（支持通配符和参数）
   * @param pattern 模式
   * @param path 实际路径
   * @returns 是否匹配
   */
  private matchPath(pattern: string, path: string): boolean {
    // 处理通配符
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(path);
    }

    // 处理参数占位符
    if (pattern.includes(':')) {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');
      
      if (patternParts.length !== pathParts.length) {
        return false;
      }

      return patternParts.every((part, index) => {
        return part.startsWith(':') || part === pathParts[index];
      });
    }

    return pattern === path;
  }

  /**
   * 记录审计日志
   * @param auditLog 审计日志对象
   */
  public async logAudit(auditLog: AuditLog): Promise<void> {
    try {
      // 添加到内存缓存
      this.auditLogs.push(auditLog);
      
      // 保持内存中日志数量限制
      if (this.auditLogs.length > this.maxLogsInMemory) {
        this.auditLogs.shift();
      }

      // 记录到文件日志
      const logLevel = this.mapAuditLevelToLogLevel(auditLog.level);
      logger[logLevel]('Audit Log', auditLog);

      // 如果是关键操作，发送通知（这里可以集成邮件、短信等通知服务）
      if (auditLog.level === AuditLevel.CRITICAL) {
        await this.sendCriticalOperationNotification(auditLog);
      }

      // 持久化到数据库（可选，根据需要实现）
      // await this.persistToDatabase(auditLog);
    } catch (error) {
      logger.error('Failed to log audit', { error, auditLog });
    }
  }

  /**
   * 映射审计级别到日志级别
   * @param auditLevel 审计级别
   * @returns 日志级别
   */
  private mapAuditLevelToLogLevel(auditLevel: AuditLevel): string {
    switch (auditLevel) {
      case AuditLevel.INFO:
        return 'info';
      case AuditLevel.WARN:
        return 'warn';
      case AuditLevel.ERROR:
      case AuditLevel.CRITICAL:
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * 发送关键操作通知
   * @param auditLog 审计日志
   */
  private async sendCriticalOperationNotification(auditLog: AuditLog): Promise<void> {
    // 这里可以实现邮件、短信、钉钉等通知功能
    logger.warn('Critical operation detected - notification should be sent', {
      operation: auditLog.action,
      user: auditLog.username,
      resource: auditLog.resource,
      timestamp: auditLog.timestamp
    });
  }

  /**
   * 获取审计日志
   * @param filters 过滤条件
   * @returns 审计日志列表
   */
  public getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    operationType?: OperationType;
    startDate?: Date;
    endDate?: Date;
    level?: AuditLevel;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.operationType) {
        logs = logs.filter(log => log.operationType === filters.operationType);
      }
      if (filters.level) {
        logs = logs.filter(log => log.level === filters.level);
      }
      if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

/**
 * 审计日志中间件
 * @param options 配置选项
 * @returns Express中间件函数
 */
export const auditLogger = (options: {
  excludePaths?: string[];
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
  sensitiveFields?: string[];
} = {}) => {
  const {
    excludePaths = ['/health', '/ping', '/metrics'],
    includeRequestBody = true,
    includeResponseBody = false,
    sensitiveFields = ['password', 'token', 'secret', 'key']
  } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const auditManager = AuditLogManager.getInstance();

    // 检查是否需要排除
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // 获取敏感操作配置
    const sensitiveOp = auditManager.getSensitiveOperation(req.method, req.path);

    // 生成关联ID
    const correlationId = req.headers['x-correlation-id'] as string || 
                         `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 过滤敏感字段
    const filterSensitiveData = (data: any): any => {
      if (!data || typeof data !== 'object') return data;
      
      const filtered = { ...data };
      sensitiveFields.forEach(field => {
        if (filtered[field]) {
          filtered[field] = '***';
        }
      });
      return filtered;
    };

    // 监听响应结束事件
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 构建审计日志
      const auditLog: AuditLog = {
        timestamp: new Date().toISOString(),
        level: sensitiveOp?.level || AuditLevel.INFO,
        operationType: sensitiveOp?.operationType || OperationType.read,
        resource: sensitiveOp?.resource || 'unknown',
        resourceId: req.params.id,
        userId: req.user?.id,
        username: req.user?.username,
        userRole: req.user?.role,
        action: sensitiveOp?.description || `${req.method} ${req.path}`,
        description: `用户 ${req.user?.username || 'anonymous'} 执行了 ${req.method} ${req.path} 操作`,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        requestHeaders: filterSensitiveData(req.headers),
        requestBody: includeRequestBody ? filterSensitiveData(req.body) : undefined,
        responseStatus: res.statusCode,
        responseTime,
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? responseBody : undefined,
        metadata: {
          query: req.query,
          params: req.params,
          responseBody: includeResponseBody ? responseBody : undefined,
          isSensitiveOperation: !!sensitiveOp,
          requiresApproval: sensitiveOp?.requiresApproval || false
        },
        sessionId: req.sessionID,
        correlationId
      };

      // 记录审计日志
      await auditManager.logAudit(auditLog);
    });

    next();
  };
};

/**
 * 用户行为追踪中间件
 * @returns Express中间件函数
 */
export const userActivityTracker = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user) {
      // 更新用户最后活动时间
      req.user.lastActivity = new Date();
      
      // 记录用户活动
      logger.info('User activity', {
        userId: req.user.id,
        username: req.user.username,
        action: `${req.method} ${req.path}`,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    next();
  };
};

/**
 * 获取审计日志的API端点
 * @param req 请求对象
 * @param res 响应对象
 */
export const getAuditLogs = (req: Request, res: Response): void => {
  try {
    const auditManager = AuditLogManager.getInstance();
    const { userId, resource, operationType, level, startDate, endDate } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId as string;
    if (resource) filters.resource = resource as string;
    if (operationType) filters.operationType = operationType as OperationType;
    if (level) filters.level = level as AuditLevel;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = auditManager.getAuditLogs(filters);
    
    res.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (error) {
    logger.error('Failed to get audit logs', error);
    res.status(500).json({
      success: false,
      message: '获取审计日志失败'
    });
  }
};

/**
 * 默认导出
 */
export default {
  AuditLevel,
  OperationType,
  AuditLogManager,
  auditLogger,
  userActivityTracker,
  getAuditLogs
};