/**
 * 日志系统配置
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM模式下获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 日志级别定义
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

/**
 * 日志颜色配置
 */
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// 添加颜色配置
winston.addColors(logColors);

/**
 * 日志格式配置
 * @description 定义日志输出格式
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * 文件日志格式（不包含颜色）
 */
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * 日志传输器配置
 */
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: logFormat
  }),
  // 错误日志文件
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileLogFormat
  }),
  // 所有日志文件
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileLogFormat
  })
];

/**
 * 创建日志记录器
 * @description 创建winston日志记录器实例
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false
});

/**
 * HTTP请求日志中间件配置
 * @description 配置morgan中间件的日志格式
 */
export const morganFormat = process.env.NODE_ENV === 'development' 
  ? 'dev' 
  : 'combined';

/**
 * Morgan流配置
 * @description 将morgan日志输出到winston
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  }
};

export default logger;