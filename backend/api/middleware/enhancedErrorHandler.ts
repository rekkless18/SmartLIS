/**
 * 增强版异常处理中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 * 描述：提供全局异常处理、自定义业务异常类和错误码标准化
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHelper, ResponseCode, ErrorType } from '../utils/responseFormatter.js';
import logger from '../config/logger.js';

/**
 * 业务异常基类
 */
export class BusinessError extends Error {
  public readonly code: ResponseCode;
  public readonly statusCode: number;
  public readonly errorType: ErrorType;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ResponseCode = ResponseCode.INTERNAL_ERROR,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.BUSINESS,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.isOperational = isOperational;

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证异常类
 */
export class ValidationError extends BusinessError {
  constructor(message: string = '数据验证失败', details?: any) {
    super(
      message,
      ResponseCode.VALIDATION_ERROR,
      400,
      ErrorType.VALIDATION,
      details
    );
  }
}

/**
 * 认证异常类
 */
export class AuthenticationError extends BusinessError {
  constructor(message: string = '身份认证失败', details?: any) {
    super(
      message,
      ResponseCode.UNAUTHORIZED,
      401,
      ErrorType.AUTHENTICATION,
      details
    );
  }
}

/**
 * 授权异常类
 */
export class AuthorizationError extends BusinessError {
  constructor(message: string = '权限不足', details?: any) {
    super(
      message,
      ResponseCode.FORBIDDEN,
      403,
      ErrorType.AUTHORIZATION,
      details
    );
  }
}

/**
 * 资源未找到异常类
 */
export class NotFoundError extends BusinessError {
  constructor(message: string = '资源未找到', details?: any) {
    super(
      message,
      ResponseCode.NOT_FOUND,
      404,
      ErrorType.BUSINESS,
      details
    );
  }
}

/**
 * 冲突异常类
 */
export class ConflictError extends BusinessError {
  constructor(message: string = '资源冲突', details?: any) {
    super(
      message,
      ResponseCode.CONFLICT,
      409,
      ErrorType.BUSINESS,
      details
    );
  }
}

/**
 * 数据库异常类
 */
export class DatabaseError extends BusinessError {
  constructor(message: string = '数据库操作失败', details?: any) {
    super(
      message,
      ResponseCode.DATABASE_ERROR,
      500,
      ErrorType.DATABASE,
      details
    );
  }
}

/**
 * 服务不可用异常类
 */
export class ServiceUnavailableError extends BusinessError {
  constructor(message: string = '服务暂时不可用', details?: any) {
    super(
      message,
      ResponseCode.SERVICE_UNAVAILABLE,
      503,
      ErrorType.SYSTEM,
      details
    );
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理JWT相关错误
   * @param error 错误对象
   * @returns 业务异常对象
   */
  public static handleJWTError(error: any): BusinessError {
    if (error.name === 'JsonWebTokenError') {
      return new AuthenticationError('无效的访问令牌');
    }
    if (error.name === 'TokenExpiredError') {
      return new AuthenticationError('访问令牌已过期');
    }
    if (error.name === 'NotBeforeError') {
      return new AuthenticationError('访问令牌尚未生效');
    }
    return new AuthenticationError('令牌验证失败');
  }

  /**
   * 处理数据库相关错误
   * @param error 错误对象
   * @returns 业务异常对象
   */
  public static handleDatabaseError(error: any): BusinessError {
    // PostgreSQL错误码处理
    if (error.code) {
      switch (error.code) {
        case '23505': // 唯一约束违反
          return new ConflictError('数据已存在，违反唯一性约束', {
            constraint: error.constraint,
            detail: error.detail
          });
        case '23503': // 外键约束违反
          return new ValidationError('违反外键约束', {
            constraint: error.constraint,
            detail: error.detail
          });
        case '23502': // 非空约束违反
          return new ValidationError('必填字段不能为空', {
            column: error.column,
            detail: error.detail
          });
        case '42P01': // 表不存在
          return new DatabaseError('数据表不存在');
        case '42703': // 列不存在
          return new DatabaseError('数据列不存在');
        default:
          return new DatabaseError(`数据库操作失败: ${error.message}`);
      }
    }

    // 通用数据库错误
    if (error.name === 'SequelizeValidationError') {
      return new ValidationError('数据验证失败', error.errors);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return new ConflictError('数据重复', error.errors);
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return new ValidationError('外键约束错误', error.fields);
    }

    return new DatabaseError(error.message || '数据库操作失败');
  }

  /**
   * 处理验证相关错误
   * @param error 错误对象
   * @returns 业务异常对象
   */
  public static handleValidationError(error: any): BusinessError {
    if (error.isJoi) {
      const details = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      return new ValidationError('请求参数验证失败', details);
    }

    return new ValidationError(error.message || '数据验证失败');
  }

  /**
   * 处理网络相关错误
   * @param error 错误对象
   * @returns 业务异常对象
   */
  public static handleNetworkError(error: any): BusinessError {
    if (error.code === 'ECONNREFUSED') {
      return new ServiceUnavailableError('服务连接被拒绝');
    }
    if (error.code === 'ETIMEDOUT') {
      return new ServiceUnavailableError('服务请求超时');
    }
    if (error.code === 'ENOTFOUND') {
      return new ServiceUnavailableError('服务地址未找到');
    }

    return new ServiceUnavailableError('网络连接异常');
  }
}

/**
 * 异步错误处理包装器
 * @param fn 异步函数
 * @returns 包装后的函数
 */
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 全局错误处理中间件
 * @param error 错误对象
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let processedError: BusinessError;

  // 如果已经是业务异常，直接使用
  if (error instanceof BusinessError) {
    processedError = error;
  } else {
    // 根据错误类型进行处理
    if (error.name && error.name.includes('JWT')) {
      processedError = ErrorHandler.handleJWTError(error);
    } else if (error.code || error.name?.includes('Sequelize')) {
      processedError = ErrorHandler.handleDatabaseError(error);
    } else if (error.isJoi) {
      processedError = ErrorHandler.handleValidationError(error);
    } else if (error.code && ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
      processedError = ErrorHandler.handleNetworkError(error);
    } else {
      // 未知错误
      processedError = new BusinessError(
        process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误',
        ResponseCode.INTERNAL_ERROR,
        500,
        ErrorType.SYSTEM,
        process.env.NODE_ENV === 'development' ? error : undefined,
        false
      );
    }
  }

  // 记录错误日志
  const logLevel = processedError.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('API Error occurred', {
    error: {
      name: processedError.name,
      message: processedError.message,
      code: processedError.code,
      statusCode: processedError.statusCode,
      errorType: processedError.errorType,
      stack: processedError.stack,
      details: processedError.details
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  });

  // 发送错误响应
  ResponseHelper.error(
    res,
    processedError.message,
    processedError.statusCode,
    processedError.code,
    processedError.errorType,
    processedError.details
  );
};

/**
 * 404错误处理中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`路由 ${req.method} ${req.originalUrl} 未找到`);
  next(error);
};

/**
 * 错误处理中间件配置
 */
export const setupErrorHandling = (app: any): void => {
  // 404处理
  app.use(notFoundHandler);
  
  // 全局错误处理
  app.use(globalErrorHandler);
};

/**
 * 导出所有异常类和处理函数
 */
export {
  BusinessError as AppError, // 向后兼容
};

export default {
  BusinessError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ServiceUnavailableError,
  ErrorHandler,
  asyncErrorHandler,
  globalErrorHandler,
  notFoundHandler,
  setupErrorHandling
};