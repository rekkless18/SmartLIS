/**
 * SmartLis后端应用主文件
 * 创建时间: 2025-08-20
 * 创建人: Erikwang
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 导入配置和中间件
import logger, { morganFormat, morganStream } from './config/logger.js';
import { testDatabaseConnection } from './config/database.js';
import { testRedisConnection } from './config/redis.js';
import { globalErrorHandler, notFoundHandler } from './middleware/enhancedErrorHandler.js';
import { successResponse } from './utils/response.js';

// 导入路由
import apiRoutes from './routes/index.js';

// ESM模式下获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

// 创建Express应用
const app: express.Application = express();

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' // 生产环境域名
      : 'http://localhost:5000' // 开发环境
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 压缩响应
app.use(compression());

// HTTP请求日志
app.use(morgan(morganFormat, { stream: morganStream }));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求ID中间件（用于日志追踪）
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

/**
 * 健康检查接口
 */
app.get('/api/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbConnected = await testDatabaseConnection();
    
    // 测试Redis连接（可选）
    const redisConnected = await testRedisConnection().catch(() => false);
    
    const healthInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      database: dbConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    };
    
    successResponse(res, healthInfo, '服务运行正常');
  } catch (error) {
    logger.error(`健康检查失败: ${error}`);
    res.status(503).json({
      success: false,
      error: '服务不可用',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API路由
 */
app.use('/api', apiRoutes);

// TODO: 添加其他业务路由
// app.use('/api/users', userRoutes);
// app.use('/api/submissions', submissionRoutes);
// app.use('/api/samples', sampleRoutes);
// app.use('/api/experiments', experimentRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/laboratory', laboratoryRoutes);
// app.use('/api/environment', environmentRoutes);
// app.use('/api/settings', settingsRoutes);

/**
 * 404处理中间件
 */
app.use(notFoundHandler);

/**
 * 全局错误处理中间件
 */
app.use(globalErrorHandler);

/**
 * 优雅关闭处理
 */
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，开始优雅关闭..');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，开始优雅关闭..');
  process.exit(0);
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

export default app;
