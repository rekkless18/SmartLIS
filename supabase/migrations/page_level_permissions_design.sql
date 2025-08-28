-- 页面级权限设计清单
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 定义应该保留的页面级权限，与前端路由和侧导航一致

-- =============================================================================
-- 页面级权限设计原则
-- =============================================================================
-- 1. 权限粒度统一为页面级别（对应侧导航子菜单级别）
-- 2. 每个页面对应一个权限，有权限即可访问页面并进行所有操作
-- 3. 移除所有按钮和操作级别的权限（如edit、delete、create等）
-- 4. 权限命名规范：模块.功能 或 模块.页面名称

-- =============================================================================
-- 应该保留的页面级权限清单
-- =============================================================================

-- 首页模块（所有用户都可访问，无需权限）
-- dashboard.view - 首页看板

-- 送检管理模块
-- submission.list - 送检列表（包含查看、创建、编辑、删除等所有操作）
-- submission.create - 送检申请（创建送检单页面）
-- submission.detail - 送检详情（查看送检详情页面）
-- submission.progress - 进度查询（查询送检进度页面）

-- 样本管理模块
-- sample.list - 样本列表（包含所有样本管理操作）
-- sample.receive - 样本接收（样本接收页面）
-- sample.storage - 样本存储（样本存储管理页面）
-- sample.destroy - 样本销毁（样本销毁管理页面）

-- 普检实验管理模块
-- routine.list - 普检实验列表
-- routine.data_entry - 数据录入
-- routine.data_review - 数据审核
-- routine.exception - 异常处理

-- 质谱实验管理模块
-- mass_spec.list - 质谱实验列表
-- mass_spec.data_entry - 数据录入
-- mass_spec.data_review - 数据审核
-- mass_spec.qc - 质量控制
-- mass_spec.exception - 异常处理

-- 特检实验管理模块
-- special.list - 特检实验列表
-- special.wet_lab - 湿实验室
-- special.instrument - 仪器操作
-- special.analysis - 分析解读
-- special.exception - 异常中心

-- 报告管理模块
-- report.list - 报告列表
-- report.edit - 报告编辑（包含创建和编辑）
-- report.review - 报告审核
-- report.template - 报告模板

-- 实验室管理模块
-- lab.equipment - 设备管理
-- lab.consumables - 耗材管理
-- lab.reservation - 预约管理

-- 环境管理模块
-- environment.monitoring - 环境监控

-- 用户权限管理模块
-- user.list - 用户管理（包含用户的增删改查和角色分配）
-- role.list - 角色管理（包含角色的增删改查和权限分配）
-- permission.config - 权限配置（系统权限配置）

-- 系统设置模块
-- settings.basic - 基础配置
-- settings.notification - 通知设置
-- settings.log - 系统日志
-- settings.import_export - 数据导入导出

-- =============================================================================
-- 需要清理的功能级权限（这些权限不符合页面级设计）
-- =============================================================================

-- 以下权限应该被清理，因为它们是功能级权限：
-- *.edit - 编辑操作
-- *.delete - 删除操作
-- *.create - 创建操作
-- *.update - 更新操作
-- *.approve - 审批操作
-- *.execute - 执行操作
-- *.publish - 发布操作
-- *.download - 下载操作
-- *.transfer - 转移操作
-- *.receive - 接收操作
-- *.assign_role - 分配角色操作
-- *.manage - 管理操作
-- *.config - 配置操作
-- *.backup - 备份操作
-- *.restore - 恢复操作
-- *.monitor - 监控操作

-- 特别注意：
-- user.edit, user.delete, user.create 应该合并到 user.list
-- role.edit, role.delete, role.create 应该合并到 role.list
-- 其他类似的功能级权限都应该合并到对应的页面级权限中