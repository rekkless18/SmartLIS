/**
 * 权限映射配置
 * 定义API路由与数据库权限代码的映射关系
 * @author Erikwang
 * @date 2025-01-20
 */

/**
 * API权限映射配置
 * 键为API路由模式，值为所需的权限代码
 */
export const API_PERMISSION_MAP: Record<string, string> = {
  // 用户管理API权限映射
  'GET /api/users': 'user.list',
  'GET /api/users/:id': 'user.list',
  'POST /api/users': 'user.create',
  'PUT /api/users/:id': 'user.edit',
  'DELETE /api/users/:id': 'user.delete',
  'POST /api/users/:id/reset-password': 'user.edit',
  'PUT /api/users/:id/status': 'user.edit',
  'POST /api/users/:id/roles': 'user.edit',

  // 角色管理API权限映射
  'GET /api/roles': 'role.list',
  'GET /api/roles/:id': 'role.list',
  'POST /api/roles': 'role.create',
  'PUT /api/roles/:id': 'role.edit',
  'DELETE /api/roles/:id': 'role.delete',
  'GET /api/roles/:id/permissions': 'role.list',
  'POST /api/roles/:id/permissions': 'role.edit',

  // 权限管理API权限映射
  'GET /api/permissions': 'permission.config',
  'GET /api/permissions/:id': 'permission.config',
  'POST /api/permissions': 'permission.config',
  'PUT /api/permissions/:id': 'permission.config',
  'DELETE /api/permissions/:id': 'permission.config',
  'GET /api/permissions/modules': 'permission.config',
  'GET /api/permissions/grouped': 'permission.config',
  'POST /api/permissions/assign': 'permission.config',

  // 样本管理API权限映射
  'GET /api/samples': 'sample.list',
  'GET /api/samples/:id': 'sample.list',
  'POST /api/samples': 'sample.create',
  'PUT /api/samples/:id': 'sample.edit',
  'DELETE /api/samples/:id': 'sample.delete',
  'POST /api/samples/:id/receive': 'sample.receive',
  'POST /api/samples/:id/storage': 'sample.storage',
  'POST /api/samples/:id/destroy': 'sample.destroy',

  // 检测项目API权限映射
  'GET /api/tests': 'routine.list',
  'GET /api/tests/:id': 'routine.list',
  'POST /api/tests': 'routine.create',
  'PUT /api/tests/:id': 'routine.edit',
  'DELETE /api/tests/:id': 'routine.delete',
  'POST /api/tests/:id/results': 'routine.data_entry',

  // 报告管理API权限映射
  'GET /api/reports': 'report.list',
  'GET /api/reports/:id': 'report.list',
  'POST /api/reports': 'report.edit',
  'PUT /api/reports/:id': 'report.edit',
  'DELETE /api/reports/:id': 'report.delete',
  'POST /api/reports/:id/generate-pdf': 'report.edit',
  'GET /api/reports/statistics': 'report.list',

  // 系统设置API权限映射
  'GET /api/system/sample-types': 'settings.basic',
  'POST /api/system/sample-types': 'settings.basic',
  'PUT /api/system/sample-types/:id': 'settings.basic',
  'DELETE /api/system/sample-types/:id': 'settings.basic',
  'GET /api/system/test-items': 'settings.basic',
  'POST /api/system/test-items': 'settings.basic',
  'PUT /api/system/test-items/:id': 'settings.basic',
  'DELETE /api/system/test-items/:id': 'settings.basic',
  'GET /api/system/settings': 'settings.basic',
  'PUT /api/system/settings/:key': 'settings.basic',
}

/**
 * 根据请求方法和路径获取所需权限
 * @param method HTTP方法
 * @param path 请求路径
 * @returns 所需权限代码，如果未找到则返回null
 */
export function getRequiredPermission(method: string, path: string): string | null {
  // 标准化路径，将路径参数替换为占位符
  const normalizedPath = normalizePath(path)
  const key = `${method.toUpperCase()} ${normalizedPath}`
  
  return API_PERMISSION_MAP[key] || null
}

/**
 * 标准化API路径
 * 将实际的ID参数替换为占位符
 * @param path 原始路径
 * @returns 标准化后的路径
 */
function normalizePath(path: string): string {
  // 移除查询参数
  const pathWithoutQuery = path.split('?')[0]
  
  // 将UUID格式的参数替换为:id占位符
  const uuidPattern = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  let normalizedPath = pathWithoutQuery.replace(uuidPattern, '/:id')
  
  // 将数字ID替换为:id占位符
  const numericIdPattern = /\/\d+/g
  normalizedPath = normalizedPath.replace(numericIdPattern, '/:id')
  
  return normalizedPath
}

/**
 * 检查用户是否有访问特定API的权限
 * @param userPermissions 用户权限列表
 * @param method HTTP方法
 * @param path 请求路径
 * @returns 是否有权限
 */
export function hasApiPermission(
  userPermissions: string[],
  method: string,
  path: string
): boolean {
  const requiredPermission = getRequiredPermission(method, path)
  
  if (!requiredPermission) {
    // 如果没有配置权限要求，默认允许访问
    return true
  }
  
  return userPermissions.includes(requiredPermission)
}

/**
 * 权限分组配置
 * 用于前端菜单权限控制
 */
export const PERMISSION_GROUPS = {
  // 用户权限管理模块
  USER_MANAGEMENT: {
    module: '用户权限管理',
    permissions: [
      'user.list',
      'user.create', 
      'user.edit',
      'user.delete',
      'role.list',
      'role.create',
      'role.edit', 
      'role.delete',
      'permission.config'
    ]
  },
  
  // 样本管理模块
  SAMPLE_MANAGEMENT: {
    module: '样本管理',
    permissions: [
      'sample.list',
      'sample.create',
      'sample.edit',
      'sample.delete',
      'sample.receive',
      'sample.storage',
      'sample.destroy'
    ]
  },
  
  // 实验管理模块
  EXPERIMENT_MANAGEMENT: {
    module: '实验管理',
    permissions: [
      'routine.list',
      'routine.data_entry',
      'routine.data_review',
      'routine.exception',
      'mass_spec.list',
      'mass_spec.data_entry',
      'mass_spec.data_review',
      'mass_spec.qc',
      'special.list',
      'special.wet_lab',
      'special.instrument',
      'special.analysis'
    ]
  },
  
  // 报告管理模块
  REPORT_MANAGEMENT: {
    module: '报告管理',
    permissions: [
      'report.list',
      'report.edit',
      'report.review',
      'report.template'
    ]
  },
  
  // 系统设置模块
  SYSTEM_SETTINGS: {
    module: '系统设置',
    permissions: [
      'settings.basic',
      'settings.notification',
      'settings.log',
      'settings.import_export'
    ]
  }
}