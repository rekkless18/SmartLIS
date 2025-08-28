/**
 * 响应格式化工具函数
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { Response } from 'express';

/**
 * 标准API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 成功响应
 * @description 返回成功的API响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP状态码，默认200
 */
export const successResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || '操作成功',
    data,
    timestamp: new Date().toISOString()
  };
  
  res.status(statusCode).json(response);
};

/**
 * 分页成功响应
 * @description 返回带分页信息的成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param pagination 分页信息
 * @param message 响应消息
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginationInfo,
  message?: string
): void => {
  const response: ApiResponse<T[]> = {
    success: true,
    message: message || '查询成功',
    data,
    pagination,
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(response);
};

/**
 * 错误响应
 * @description 返回错误的API响应
 * @param res Express响应对象
 * @param error 错误消息
 * @param statusCode HTTP状态码，默认400
 * @param data 额外的错误数据
 */
export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 400,
  data?: any
): void => {
  const response: ApiResponse = {
    success: false,
    error,
    data,
    timestamp: new Date().toISOString()
  };
  
  res.status(statusCode).json(response);
};

/**
 * 创建成功响应
 * @description 返回资源创建成功的响应
 * @param res Express响应对象
 * @param data 创建的资源数据
 * @param message 响应消息
 */
export const createdResponse = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  successResponse(res, data, message || '创建成功', 201);
};

/**
 * 无内容响应
 * @description 返回无内容的成功响应（如删除操作）
 * @param res Express响应对象
 * @param message 响应消息
 */
export const noContentResponse = (
  res: Response,
  message?: string
): void => {
  const response: ApiResponse = {
    success: true,
    message: message || '操作成功',
    timestamp: new Date().toISOString()
  };
  
  res.status(204).json(response);
};

/**
 * 未找到响应
 * @description 返回资源未找到的响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const notFoundResponse = (
  res: Response,
  message?: string
): void => {
  errorResponse(res, message || '资源未找到', 404);
};

/**
 * 未授权响应
 * @description 返回未授权的响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const unauthorizedResponse = (
  res: Response,
  message?: string
): void => {
  errorResponse(res, message || '未授权访问', 401);
};

/**
 * 禁止访问响应
 * @description 返回禁止访问的响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const forbiddenResponse = (
  res: Response,
  message?: string
): void => {
  errorResponse(res, message || '权限不足', 403);
};

/**
 * 冲突响应
 * @description 返回资源冲突的响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const conflictResponse = (
  res: Response,
  message?: string
): void => {
  errorResponse(res, message || '资源冲突', 409);
};

/**
 * 验证失败响应
 * @description 返回数据验证失败的响应
 * @param res Express响应对象
 * @param errors 验证错误信息
 */
export const validationErrorResponse = (
  res: Response,
  errors: string[] | string
): void => {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
  errorResponse(res, `验证失败: ${errorMessage}`, 422);
};

/**
 * 服务器错误响应
 * @description 返回服务器内部错误的响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const serverErrorResponse = (
  res: Response,
  message?: string
): void => {
  errorResponse(res, message || '服务器内部错误', 500);
};

/**
 * 计算分页信息
 * @description 根据总数、页码和每页数量计算分页信息
 * @param total 总记录数
 * @param page 当前页码
 * @param limit 每页记录数
 * @returns 分页信息
 */
export const calculatePagination = (
  total: number,
  page: number,
  limit: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages
  };
};

/**
 * 格式化查询结果
 * @description 格式化数据库查询结果，移除敏感字段
 * @param data 原始数据
 * @param excludeFields 要排除的字段列表
 * @returns 格式化后的数据
 */
export const formatQueryResult = <T extends Record<string, any>>(
  data: T | T[],
  excludeFields: string[] = ['password_hash', 'created_by', 'updated_by']
): T | T[] => {
  const removeFields = (obj: T): T => {
    const result = { ...obj };
    excludeFields.forEach(field => {
      delete result[field];
    });
    return result;
  };
  
  if (Array.isArray(data)) {
    return data.map(removeFields);
  }
  
  return removeFields(data);
};