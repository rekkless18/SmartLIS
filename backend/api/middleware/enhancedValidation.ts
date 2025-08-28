/**
 * 增强版参数校验中间件
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 * 描述：提供请求参数验证、常用验证规则和自定义验证器
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './enhancedErrorHandler.js';
import logger from '../config/logger.js';

/**
 * 验证目标枚举
 */
export enum ValidationTarget {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers'
}

/**
 * 验证选项接口
 */
export interface ValidationOptions {
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  abortEarly?: boolean;
  convert?: boolean;
  skipOnError?: boolean;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  data?: any;
  errors?: any[];
}

/**
 * 自定义验证器类
 */
export class CustomValidators {
  /**
   * 中国手机号验证
   */
  static chinesePhone = Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .message('请输入有效的中国手机号码');

  /**
   * 中国身份证号验证
   */
  static chineseIdCard = Joi.string()
    .pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/)
    .message('请输入有效的中国身份证号码');

  /**
   * 强密码验证（至少8位，包含大小写字母、数字和特殊字符）
   */
  static strongPassword = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)  
    .message('密码必须至少8位，包含大小写字母、数字和特殊字符');

  /**
   * 中等强度密码验证（至少6位，包含字母和数字）
   */
  static mediumPassword = Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]/)
    .message('密码必须至少6位，包含字母和数字');

  /**
   * UUID验证
   */
  static uuid = Joi.string()
    .uuid({ version: ['uuidv4'] })
    .message('请输入有效的UUID格式');

  /**
   * 日期范围验证
   */
  static dateRange = (startField: string, endField: string) => {
    return Joi.object().custom((value, helpers) => {
      const startDate = new Date(value[startField]);
      const endDate = new Date(value[endField]);
      
      if (startDate >= endDate) {
        return helpers.error('date.range', { startField, endField });
      }
      
      return value;
    }).messages({
      'date.range': `${endField}必须晚于${startField}`
    });
  };

  /**
   * 文件大小验证（字节）
   */
  static fileSize = (maxSize: number) => {
    return Joi.number()
      .max(maxSize)
      .message(`文件大小不能超过${Math.round(maxSize / 1024 / 1024)}MB`);
  };

  /**
   * 文件类型验证
   */
  static fileType = (allowedTypes: string[]) => {
    return Joi.string()
      .valid(...allowedTypes)
      .message(`文件类型必须是：${allowedTypes.join(', ')}`);
  };

  /**
   * 数组长度范围验证
   */
  static arrayLength = (min: number, max: number) => {
    return Joi.array()
      .min(min)
      .max(max)
      .message(`数组长度必须在${min}-${max}之间`);
  };

  /**
   * 中文字符验证
   */
  static chineseText = Joi.string()
    .pattern(/^[\u4e00-\u9fa5]+$/)
    .message('只能输入中文字符');

  /**
   * 英文字符验证
   */
  static englishText = Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .message('只能输入英文字符');

  /**
   * 用户名验证（字母、数字、下划线，3-20位）
   */
  static username = Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .message('用户名只能包含字母和数字，长度3-20位');

  /**
   * IP地址验证
   */
  static ipAddress = Joi.string()
    .ip({ version: ['ipv4', 'ipv6'] })
    .message('请输入有效的IP地址');

  /**
   * URL验证
   */
  static url = Joi.string()
    .uri()
    .message('请输入有效的URL地址');

  /**
   * 经纬度验证
   */
  static longitude = Joi.number()
    .min(-180)
    .max(180)
    .message('经度必须在-180到180之间');

  static latitude = Joi.number()
    .min(-90)
    .max(90)
    .message('纬度必须在-90到90之间');
}

/**
 * 常用验证模式
 */
export class CommonSchemas {
  /**
   * 分页查询模式
   */
  static pagination = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码必须大于0'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量必须大于0',
      'number.max': '每页数量不能超过100'
    }),
    sortBy: Joi.string().optional().messages({
      'string.base': '排序字段必须是字符串'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': '排序方式只能是asc或desc'
    })
  });

  /**
   * 用户注册模式
   */
  static userRegister = Joi.object({
    username: CustomValidators.username.required(),
    email: Joi.string().email().required().messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
    password: CustomValidators.strongPassword.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': '确认密码必须与密码一致',
      'any.required': '确认密码是必填项'
    }),
    phone: CustomValidators.chinesePhone.optional(),
    realName: Joi.string().min(2).max(50).optional().messages({
      'string.min': '真实姓名至少2个字符',
      'string.max': '真实姓名不能超过50个字符'
    })
  });

  /**
   * 用户登录模式
   */
  static userLogin = Joi.object({
    username: Joi.string().required().messages({
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().required().messages({
      'any.required': '密码是必填项'
    }),
    rememberMe: Joi.boolean().default(false)
  });

  /**
   * 修改密码模式
   */
  static changePassword = Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': '原密码是必填项'
    }),
    newPassword: CustomValidators.strongPassword.required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': '确认密码必须与新密码一致',
      'any.required': '确认密码是必填项'
    })
  });

  /**
   * UUID参数模式
   */
  static uuidParam = Joi.object({
    id: CustomValidators.uuid.required()
  });

  /**
   * 文件上传模式
   */
  static fileUpload = Joi.object({
    filename: Joi.string().required().messages({
      'any.required': '文件名是必填项'
    }),
    mimetype: CustomValidators.fileType(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']).required(),
    size: CustomValidators.fileSize(10 * 1024 * 1024).required() // 10MB
  });

  /**
   * 搜索查询模式
   */
  static search = Joi.object({
    keyword: Joi.string().min(1).max(100).required().messages({
      'string.min': '搜索关键词不能为空',
      'string.max': '搜索关键词不能超过100个字符',
      'any.required': '搜索关键词是必填项'
    }),
    category: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
      'date.min': '结束日期必须晚于开始日期'
    })
  });
}

/**
 * 验证器类
 */
export class Validator {
  /**
   * 验证数据
   * @param schema Joi验证模式
   * @param data 待验证数据
   * @param options 验证选项
   * @returns 验证结果
   */
  public static validate(
    schema: Joi.ObjectSchema,
    data: any,
    options: ValidationOptions = {}
  ): ValidationResult {
    const defaultOptions: ValidationOptions = {
      allowUnknown: false,
      stripUnknown: true,
      abortEarly: false,
      convert: true,
      ...options
    };

    const { error, value } = schema.validate(data, defaultOptions);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
        type: detail.type
      }));

      return {
        isValid: false,
        errors
      };
    }

    return {
      isValid: true,
      data: value
    };
  }

  /**
   * 创建验证中间件
   * @param schema Joi验证模式
   * @param target 验证目标
   * @param options 验证选项
   * @returns Express中间件函数
   */
  public static createMiddleware(
    schema: Joi.ObjectSchema,
    target: ValidationTarget = ValidationTarget.BODY,
    options: ValidationOptions = {}
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const data = req[target];
        const result = Validator.validate(schema, data, options);

        if (!result.isValid) {
          logger.warn('Validation failed', {
            target,
            errors: result.errors,
            data,
            url: req.url,
            method: req.method
          });

          throw new ValidationError('请求参数验证失败', result.errors);
        }

        // 将验证后的数据替换原始数据
        req[target] = result.data;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * 多目标验证中间件
   * @param schemas 验证模式映射
   * @param options 验证选项
   * @returns Express中间件函数
   */
  public static createMultiTargetMiddleware(
    schemas: Partial<Record<ValidationTarget, Joi.ObjectSchema>>,
    options: ValidationOptions = {}
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const allErrors: any[] = [];

        for (const [target, schema] of Object.entries(schemas)) {
          if (schema) {
            const data = req[target as ValidationTarget];
            const result = Validator.validate(schema, data, options);

            if (!result.isValid) {
              allErrors.push(...(result.errors || []));
            } else {
              // 更新验证后的数据
              req[target as ValidationTarget] = result.data;
            }
          }
        }

        if (allErrors.length > 0) {
          logger.warn('Multi-target validation failed', {
            errors: allErrors,
            url: req.url,
            method: req.method
          });

          throw new ValidationError('请求参数验证失败', allErrors);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

/**
 * 快捷验证中间件函数
 */
export const validateBody = (schema: Joi.ObjectSchema, options?: ValidationOptions) => 
  Validator.createMiddleware(schema, ValidationTarget.BODY, options);

export const validateQuery = (schema: Joi.ObjectSchema, options?: ValidationOptions) => 
  Validator.createMiddleware(schema, ValidationTarget.QUERY, options);

export const validateParams = (schema: Joi.ObjectSchema, options?: ValidationOptions) => 
  Validator.createMiddleware(schema, ValidationTarget.PARAMS, options);

export const validateHeaders = (schema: Joi.ObjectSchema, options?: ValidationOptions) => 
  Validator.createMiddleware(schema, ValidationTarget.HEADERS, options);

/**
 * 常用验证中间件
 */
export const validatePagination = validateQuery(CommonSchemas.pagination);
export const validateUuidParam = validateParams(CommonSchemas.uuidParam);
export const validateUserRegister = validateBody(CommonSchemas.userRegister);
export const validateUserLogin = validateBody(CommonSchemas.userLogin);
export const validateChangePassword = validateBody(CommonSchemas.changePassword);
export const validateSearch = validateQuery(CommonSchemas.search);

/**
 * 默认导出
 */
export default {
  ValidationTarget,
  CustomValidators,
  CommonSchemas,
  Validator,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validatePagination,
  validateUuidParam,
  validateUserRegister,
  validateUserLogin,
  validateChangePassword,
  validateSearch
};