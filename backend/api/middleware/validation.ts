/**
 * 数据验证中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler.js';

/**
 * 验证请求数据的中间件
 * @description 使用Joi验证请求体、查询参数或路径参数
 * @param schema Joi验证模式
 * @param property 要验证的属性（body, query, params）
 * @returns 验证中间件函数
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      next(new AppError(`验证失败: ${errorMessage}`, 400));
      return;
    }
    
    next();
  };
};

/**
 * 用户注册验证模式
 */
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少需要3个字符',
      'string.max': '用户名不能超过30个字符',
      'any.required': '用户名是必填项'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '密码至少需要6个字符',
      'string.max': '密码不能超过128个字符',
      'any.required': '密码是必填项'
    }),
  
  realName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': '真实姓名至少需要2个字符',
      'string.max': '真实姓名不能超过50个字符',
      'any.required': '真实姓名是必填项'
    }),
  
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': '请输入有效的手机号码'
    }),
  
  department: Joi.string()
    .max(100)
    .optional(),
  
  position: Joi.string()
    .max(100)
    .optional()
});

/**
 * 用户登录验证模式
 */
export const loginSchema = Joi.object({
  username: Joi.string()
    .when('loginType', {
      is: 'username',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': '用户名是必填项'
    }),
  
  email: Joi.string()
    .email()
    .when('loginType', {
      is: 'email',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码是必填项'
    }),
  
  loginType: Joi.string()
    .valid('username', 'email')
    .default('username')
    .messages({
      'any.only': '登录类型只能是 username 或 email'
    })
});

/**
 * 修改密码验证模式
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': '当前密码是必填项'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '新密码至少需要6个字符',
      'string.max': '新密码不能超过128个字符',
      'any.required': '新密码是必填项'
    })
});

/**
 * UUID参数验证模式
 */
export const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'ID必须是有效的UUID格式',
      'any.required': 'ID是必填项'
    })
});

/**
 * 分页查询验证模式
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': '页码必须是整数',
      'number.min': '页码必须大于0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量必须大于0',
      'number.max': '每页数量不能超过100'
    }),
  
  search: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': '搜索关键词不能超过100个字符'
    }),
  
  status: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': '状态必须是字符串'
    }),
  
  sortBy: Joi.string()
    .optional(),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序方式只能是 asc 或 desc'
    })
});

/**
 * 样本类型验证模式
 */
export const sampleTypeSchema = Joi.object({
  code: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '样本类型编码不能超过50个字符',
      'any.required': '样本类型编码是必填项'
    }),
  
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': '样本类型名称不能超过100个字符',
      'any.required': '样本类型名称是必填项'
    }),
  
  description: Joi.string()
    .optional(),
  
  storageRequirements: Joi.string()
    .optional(),
  
  defaultDestroyDays: Joi.number()
    .integer()
    .min(1)
    .default(30)
    .messages({
      'number.integer': '默认销毁天数必须是整数',
      'number.min': '默认销毁天数必须大于0'
    }),
  
  isActive: Joi.boolean()
    .default(true),
  
  sortOrder: Joi.number()
    .integer()
    .default(0)
});