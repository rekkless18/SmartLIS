/**
 * 统一响应格式组件 - 增强版
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 * 描述：提供标准化的API响应格式，支持成功、错误、分页等多种响应类型
 */

import { Response } from 'express';
import logger from '../config/logger.js';

/**
 * 标准API响应接口
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  error?: {
    type: string;
    details?: any;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
    pagination?: PaginationMeta;
  };
}

/**
 * 分页元数据接口
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 响应代码枚举
 */
export enum ResponseCode {
  // 成功响应
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  
  // 客户端错误
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 服务器错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE'
}

/**
 * 响应格式化器类
 */
export class ResponseFormatter {
  private static instance: ResponseFormatter;
  private requestId?: string;
  private version: string = '1.0.0';

  private constructor() {}

  /**
   * 获取单例实例
   * @returns ResponseFormatter实例
   */
  public static getInstance(): ResponseFormatter {
    if (!ResponseFormatter.instance) {
      ResponseFormatter.instance = new ResponseFormatter();
    }
    return ResponseFormatter.instance;
  }

  /**
   * 设置请求ID
   * @param requestId 请求ID
   */
  public setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * 设置API版本
   * @param version API版本
   */
  public setVersion(version: string): void {
    this.version = version;
  }

  /**
   * 创建成功响应
   * @param data 响应数据
   * @param message 响应消息
   * @param code 响应代码
   * @returns 标准响应对象
   */
  public success<T>(
    data?: T,
    message: string = '操作成功',
    code: ResponseCode = ResponseCode.SUCCESS
  ): StandardApiResponse<T> {
    return {
      success: true,
      code,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
        version: this.version
      }
    };
  }

  /**
   * 创建分页成功响应
   * @param data 响应数据
   * @param pagination 分页信息
   * @param message 响应消息
   * @returns 标准响应对象
   */
  public paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message: string = '查询成功'
  ): StandardApiResponse<T[]> {
    return {
      success: true,
      code: ResponseCode.SUCCESS,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
        version: this.version,
        pagination
      }
    };
  }

  /**
   * 创建错误响应
   * @param message 错误消息
   * @param code 响应代码
   * @param errorType 错误类型
   * @param details 错误详情
   * @param stack 错误堆栈（仅开发环境）
   * @returns 标准响应对象
   */
  public error(
    message: string,
    code: ResponseCode = ResponseCode.INTERNAL_ERROR,
    errorType: ErrorType = ErrorType.SYSTEM,
    details?: any,
    stack?: string
  ): StandardApiResponse {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
      success: false,
      code,
      message,
      error: {
        type: errorType,
        details: isDevelopment ? details : undefined,
        stack: isDevelopment ? stack : undefined
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
        version: this.version
      }
    };
  }

  /**
   * 创建验证错误响应
   * @param errors 验证错误列表
   * @param message 错误消息
   * @returns 标准响应对象
   */
  public validationError(
    errors: any[],
    message: string = '数据验证失败'
  ): StandardApiResponse {
    return this.error(
      message,
      ResponseCode.VALIDATION_ERROR,
      ErrorType.VALIDATION,
      { errors }
    );
  }
}

/**
 * 响应助手函数
 */
export class ResponseHelper {
  /**
   * 发送成功响应
   * @param res Express响应对象
   * @param data 响应数据
   * @param message 响应消息
   * @param statusCode HTTP状态码
   * @param code 响应代码
   */
  public static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    code?: ResponseCode
  ): void {
    const formatter = ResponseFormatter.getInstance();
    const response = formatter.success(data, message, code);
    res.status(statusCode).json(response);
  }

  /**
   * 发送分页响应
   * @param res Express响应对象
   * @param data 响应数据
   * @param pagination 分页信息
   * @param message 响应消息
   */
  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string
  ): void {
    const formatter = ResponseFormatter.getInstance();
    const response = formatter.paginated(data, pagination, message);
    res.status(200).json(response);
  }

  /**
   * 发送错误响应
   * @param res Express响应对象
   * @param message 错误消息
   * @param statusCode HTTP状态码
   * @param code 响应代码
   * @param errorType 错误类型
   * @param details 错误详情
   */
  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: ResponseCode,
    errorType?: ErrorType,
    details?: any
  ): void {
    const formatter = ResponseFormatter.getInstance();
    const response = formatter.error(message, code, errorType, details);
    
    // 记录错误日志
    logger.error(`API Error: ${message}`, {
      statusCode,
      code,
      errorType,
      details,
      requestId: formatter['requestId']
    });
    
    res.status(statusCode).json(response);
  }

  /**
   * 发送验证错误响应
   * @param res Express响应对象
   * @param errors 验证错误列表
   * @param message 错误消息
   */
  public static validationError(
    res: Response,
    errors: any[],
    message?: string
  ): void {
    const formatter = ResponseFormatter.getInstance();
    const response = formatter.validationError(errors, message);
    res.status(400).json(response);
  }

  /**
   * 创建分页元数据
   * @param page 当前页码
   * @param limit 每页数量
   * @param total 总记录数
   * @returns 分页元数据
   */
  public static createPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}

/**
 * 快捷响应函数（向后兼容）
 */
export const sendSuccess = ResponseHelper.success;
export const sendError = ResponseHelper.error;
export const sendPaginated = ResponseHelper.paginated;
export const sendValidationError = ResponseHelper.validationError;

/**
 * 默认导出
 */
export default {
  ResponseFormatter,
  ResponseHelper,
  ResponseCode,
  ErrorType,
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError
};