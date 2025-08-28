/**
 * 权限管理工具函数
 * 定义系统权限配置和权限检查逻辑
 * @author Erikwang
 * @date 2025-08-20
 */

// 权限定义
export const PERMISSIONS = {
  // 送检管理权限
  SUBMISSION: {
    VIEW: 'submission.view',
    CREATE: 'submission.create',
    EDIT: 'submission.edit',
    DELETE: 'submission.delete',
    APPROVE: 'submission.approve',
  },
  // 样本管理权限
  SAMPLE: {
    VIEW: 'sample.view',
    RECEIVE: 'sample.receive',
    EDIT: 'sample.edit',
    DELETE: 'sample.delete',
    TRANSFER: 'sample.transfer',
  },
  // 实验管理权限
  EXPERIMENT: {
    VIEW: 'experiment.view',
    CREATE: 'experiment.create',
    EDIT: 'experiment.edit',
    DELETE: 'experiment.delete',
    EXECUTE: 'experiment.execute',
  },
  // 报告管理权限
  REPORT: {
    VIEW: 'report.view',
    CREATE: 'report.create',
    EDIT: 'report.edit',
    DELETE: 'report.delete',
    PUBLISH: 'report.publish',
    DOWNLOAD: 'report.download',
  },
  // 实验室管理权限
  LAB: {
    VIEW: 'lab.view',
    MANAGE: 'lab.manage',
    CONFIG: 'lab.config',
  },
  // 环境管理权限
  ENVIRONMENT: {
    VIEW: 'environment.view',
    MONITOR: 'environment.monitor',
    CONFIG: 'environment.config',
  },
  // 用户管理权限
  USER: {
    VIEW: 'user.view',
    CREATE: 'user.create',
    EDIT: 'user.edit',
    DELETE: 'user.delete',
    MANAGE: 'user.manage',
    ASSIGN_ROLE: 'user.assign_role',
  },
  // 系统设置权限
  SYSTEM: {
    VIEW: 'system.view',
    CONFIG: 'system.config',
    BACKUP: 'system.backup',
    RESTORE: 'system.restore',
  },
} as const

// 角色定义
export const ROLES = {
  ADMIN: 'admin',
  LAB_MANAGER: 'lab_manager',
  TECHNICIAN: 'technician',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const

// 页面路径与权限的映射关系（与侧导航结构一致）
export const PAGE_PERMISSIONS: Record<string, string[]> = {
  // 首页看板 - 所有用户都可以访问
  '/dashboard': [],

  // 送检管理
  '/submission': ['submission.list'],
  '/submission/list': ['submission.list'],
  '/submission/create': ['submission.create'],
  '/submission/detail': ['submission.list'],

  // 样本管理
  '/sample': ['sample.list'],
  '/sample/list': ['sample.list'],
  '/sample/receive': ['sample.receive'],
  '/sample/storage': ['sample.storage'],
  '/sample/destroy': ['sample.destroy'],

  // 普检实验管理
  '/general-experiment': ['routine.list'],
  '/general-experiment/list': ['routine.list'],
  '/general-experiment/data-entry': ['routine.data_entry'],
  '/general-experiment/data-review': ['routine.data_review'],
  '/general-experiment/exception-handle': ['routine.exception'],

  // 质谱实验管理
  '/mass-spec': ['mass_spec.list'],
  '/mass-spec/list': ['mass_spec.list'],
  '/mass-spec/data-entry': ['mass_spec.data_entry'],
  '/mass-spec/data-review': ['mass_spec.data_review'],
  '/mass-spec/quality-control': ['mass_spec.qc'],
  '/mass-spec/exception-handle': ['mass_spec.exception'],

  // 特检实验管理
  '/special-experiment': ['special.list'],
  '/special-experiment/wet-lab': ['special.wet_lab'],
  '/special-experiment/machine-operation': ['special.instrument'],
  '/special-experiment/analysis-interpretation': ['special.analysis'],
  '/special-experiment/exception-center': ['special.exception'],

  // 报告管理
  '/report': ['report.list'],
  '/report/list': ['report.list'],
  '/report/create': ['report.edit'],
  '/report/edit': ['report.edit'],
  '/report/review': ['report.review'],
  '/report/template': ['report.template'],

  // 实验室管理
  '/lab': ['lab.equipment'],
  '/lab/management': ['lab.equipment'],
  '/lab/equipment': ['lab.equipment'],
  '/lab/supplies': ['lab.consumables'],
  '/lab/booking': ['lab.reservation'],

  // 环境管理
  '/environment': ['environment.monitoring'],
  '/environment/monitor': ['environment.monitoring'],

  // 用户管理
  '/user': ['user.list'],
  '/user/account': ['user.list'],
  '/user/role': ['role.list'],
  '/user/management': ['user.list'],

  // 系统设置
  '/settings': ['settings.basic'],
  '/settings/system': ['settings.basic'],
}

// 角色默认权限配置
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(PERMISSIONS.SUBMISSION),
    ...Object.values(PERMISSIONS.SAMPLE),
    ...Object.values(PERMISSIONS.EXPERIMENT),
    ...Object.values(PERMISSIONS.REPORT),
    ...Object.values(PERMISSIONS.LAB),
    ...Object.values(PERMISSIONS.ENVIRONMENT),
    ...Object.values(PERMISSIONS.USER),
    ...Object.values(PERMISSIONS.SYSTEM),
  ],
  [ROLES.LAB_MANAGER]: [
    // 实验室管理员权限
    ...Object.values(PERMISSIONS.SUBMISSION),
    ...Object.values(PERMISSIONS.SAMPLE),
    ...Object.values(PERMISSIONS.EXPERIMENT),
    ...Object.values(PERMISSIONS.REPORT),
    ...Object.values(PERMISSIONS.LAB),
    ...Object.values(PERMISSIONS.ENVIRONMENT),
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.USER.EDIT,
  ],
  [ROLES.TECHNICIAN]: [
    // 技术员权限
    PERMISSIONS.SUBMISSION.VIEW,
    PERMISSIONS.SUBMISSION.CREATE,
    PERMISSIONS.SUBMISSION.EDIT,
    ...Object.values(PERMISSIONS.SAMPLE),
    PERMISSIONS.EXPERIMENT.VIEW,
    PERMISSIONS.EXPERIMENT.EXECUTE,
    PERMISSIONS.REPORT.VIEW,
    PERMISSIONS.LAB.VIEW,
    PERMISSIONS.ENVIRONMENT.VIEW,
    PERMISSIONS.ENVIRONMENT.MONITOR,
  ],
  [ROLES.ANALYST]: [
    // 分析员权限
    PERMISSIONS.SUBMISSION.VIEW,
    PERMISSIONS.SAMPLE.VIEW,
    ...Object.values(PERMISSIONS.EXPERIMENT),
    ...Object.values(PERMISSIONS.REPORT),
    PERMISSIONS.LAB.VIEW,
    PERMISSIONS.ENVIRONMENT.VIEW,
  ],
  [ROLES.VIEWER]: [
    // 查看者权限
    PERMISSIONS.SUBMISSION.VIEW,
    PERMISSIONS.SAMPLE.VIEW,
    PERMISSIONS.EXPERIMENT.VIEW,
    PERMISSIONS.REPORT.VIEW,
    PERMISSIONS.LAB.VIEW,
    PERMISSIONS.ENVIRONMENT.VIEW,
  ],
}

/**
 * 检查用户是否有指定权限
 * @param userPermissions 用户权限列表
 * @param requiredPermission 需要的权限
 * @returns 是否有权限
 */
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return userPermissions.includes(requiredPermission)
}

/**
 * 检查用户是否有任一权限
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表
 * @returns 是否有任一权限
 */
export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  )
}

/**
 * 检查用户是否有所有权限
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表
 * @returns 是否有所有权限
 */
export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  )
}

/**
 * 检查用户是否有指定角色
 * @param userRoles 用户角色列表
 * @param requiredRole 需要的角色
 * @returns 是否有角色
 */
export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  return userRoles.includes(requiredRole)
}

/**
 * 检查用户是否有任一角色
 * @param userRoles 用户角色列表
 * @param requiredRoles 需要的角色列表
 * @returns 是否有任一角色
 */
export const hasAnyRole = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  return requiredRoles.some(role => userRoles.includes(role))
}

/**
 * 检查用户是否有所有角色
 * @param userRoles 用户角色列表
 * @param requiredRoles 需要的角色列表
 * @returns 是否有所有角色
 */
export const hasAllRoles = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  return requiredRoles.every(role => userRoles.includes(role))
}

/**
 * 检查用户是否可以访问指定页面
 * @param userPermissions 用户权限列表
 * @param pagePath 页面路径
 * @returns 是否可以访问
 */
export const canAccessPage = (
  userPermissions: string[],
  pagePath: string
): boolean => {
  // 标准化路径（移除参数部分）
  const normalizedPath = pagePath.split('?')[0].split('#')[0]

  // 检查精确匹配
  const requiredPermissions = PAGE_PERMISSIONS[normalizedPath]
  if (requiredPermissions !== undefined) {
    // 如果页面不需要权限，直接允许访问
    if (requiredPermissions.length === 0) {
      return true
    }
    // 检查是否有任一所需权限
    return hasAnyPermission(userPermissions, requiredPermissions)
  }

  // 检查模糊匹配（处理动态路由）
  for (const [path, permissions] of Object.entries(PAGE_PERMISSIONS)) {
    if (normalizedPath.startsWith(path)) {
      if (permissions.length === 0) {
        return true
      }
      return hasAnyPermission(userPermissions, permissions)
    }
  }

  // 默认拒绝访问未定义的页面
  return false
}

/**
 * 根据角色获取权限列表
 * @param roles 用户角色列表
 * @returns 权限列表
 */
export const getPermissionsByRoles = (roles: string[]): string[] => {
  const permissions = new Set<string>()

  roles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    rolePermissions.forEach(permission => permissions.add(permission))
  })

  return Array.from(permissions)
}

/**
 * 检查用户是否为管理员
 * @param userRoles 用户角色列表
 * @returns 是否为管理员
 */
export const isAdmin = (userRoles: string[]): boolean => {
  return userRoles.includes(ROLES.ADMIN)
}
