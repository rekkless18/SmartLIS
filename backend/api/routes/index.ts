/**
 * API路由主入口
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import roleRoutes from './roles.js';
import permissionRoutes from './permissions.js';
import sampleRoutes from './samples.js';
import testRoutes from './tests.js';
import reportRoutes from './reports.js';
import systemRoutes from './system.js';

const router = Router();

// 认证相关路由
router.use('/auth', authRoutes);

// 用户管理路由
router.use('/users', userRoutes);

// 角色管理路由
router.use('/roles', roleRoutes);

// 权限管理路由
router.use('/permissions', permissionRoutes);

// 样本管理路由
router.use('/samples', sampleRoutes);

// 检测管理路由
router.use('/tests', testRoutes);

// 报告管理路由
router.use('/reports', reportRoutes);

// 系统管理路由
router.use('/system', systemRoutes);

export default router;