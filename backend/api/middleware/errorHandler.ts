/**
 * 错误处理中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 异步错误处理包装器
 * @description 包装异步路由处理函数，自动捕获异步错误
 * @param fn 异步函数
 * @returns 包装后的函数
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 开发环境错误响应
 * @description 在开发环境中返回详细的错误信息
 * @param err 错误对象
 * @param res 响应对象
 */
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err
  });
};

/**
 * 生产环境错误响应
 * @description 在生产环境中返回安全的错误信息
 * @param err 错误对象
 * @param res 响应对象
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  // 操作性错误：发送给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  } else {
    // 编程错误：不泄露错误详情
    logger.error('ERROR:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

/**
 * 处理JWT错误
 * @description 处理JWT相关的错误
 * @param err 错误对象
 * @returns AppError实例
 */
const handleJWTError = (): AppError => {
  return new AppError('无效的令牌，请重新登录', 401);
};

/**
 * 处理JWT过期错误
 * @description 处理JWT过期的错误
 * @param err 错误对象
 * @returns AppError实例
 */
const handleJWTExpiredError = (): AppError => {
  return new AppError('令牌已过期，请重新登录', 401);
};

/**
 * 处理数据库重复键错误
 * @description 处理数据库唯一约束违反错误
 * @param err 错误对象
 * @returns AppError实例
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const message = `重复的字段值，请使用其他值`;
  return new AppError(message, 400);
};

/**
 * 处理数据验证错误
 * @description 处理Joi验证错误
 * @param err 错误对象
 * @returns AppError实例
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = err.details?.map((el: any) => el.message) || ['验证失败'];
  const message = `无效的输入数据: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * 全局错误处理中间件
 * @description 处理应用中的所有错误
 * @param err 错误对象
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件函数
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // 处理特定类型的错误
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.code === '23505') error = handleDuplicateFieldsDB(error); // PostgreSQL唯一约束违反
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

/**
 * 404错误处理中间件
 * @description 处理未找到的路由
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件函数
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const err = new AppError(`找不到路由 ${req.originalUrl}`, 404);
  next(err);
};