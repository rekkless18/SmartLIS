/**
 * 样式工具函数
 * 提供统一的样式配置和工具函数
 * @author Erikwang
 * @date 2025-08-20
 */

// 状态配置
export const statusConfig = {
  // 通用状态
  pending: {
    label: '待处理',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    color: 'yellow'
  },
  processing: {
    label: '处理中',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue'
  },
  completed: {
    label: '已完成',
    className: 'bg-green-100 text-green-800 border-green-200',
    color: 'green'
  },
  cancelled: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    color: 'gray'
  },
  error: {
    label: '异常',
    className: 'bg-red-100 text-red-800 border-red-200',
    color: 'red'
  },
  
  // 送检状态
  received: {
    label: '已接收',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue'
  },
  testing: {
    label: '检测中',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    color: 'purple'
  },
  reporting: {
    label: '报告编制',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    color: 'orange'
  },
  
  // 实验状态
  running: {
    label: '进行中',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue'
  },
  paused: {
    label: '已暂停',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    color: 'orange'
  },
  
  // 报告状态
  draft: {
    label: '草稿',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    color: 'gray'
  },
  pending_review: {
    label: '待审核',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    color: 'yellow'
  },
  approved: {
    label: '已批准',
    className: 'bg-green-100 text-green-800 border-green-200',
    color: 'green'
  },
  rejected: {
    label: '已驳回',
    className: 'bg-red-100 text-red-800 border-red-200',
    color: 'red'
  },
  sent: {
    label: '已发送',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue'
  },
  
  // 样本状态
  destroyed: {
    label: '已销毁',
    className: 'bg-red-100 text-red-800 border-red-200',
    color: 'red'
  }
}

// 优先级配置
export const priorityConfig = {
  low: {
    label: '低',
    className: 'bg-green-50 text-green-700 border-green-200',
    color: 'green'
  },
  normal: {
    label: '普通',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    color: 'blue'
  },
  medium: {
    label: '中',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    color: 'yellow'
  },
  high: {
    label: '高',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    color: 'orange'
  },
  urgent: {
    label: '紧急',
    className: 'bg-red-50 text-red-700 border-red-200',
    color: 'red'
  },
  emergency: {
    label: '特急',
    className: 'bg-red-50 text-red-700 border-red-200',
    color: 'red'
  }
}

// 类型配置
export const typeConfig = {
  water: {
    label: '水质',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    color: 'blue'
  },
  soil: {
    label: '土壤',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    color: 'amber'
  },
  air: {
    label: '空气',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    color: 'sky'
  },
  food: {
    label: '食品',
    className: 'bg-green-50 text-green-700 border-green-200',
    color: 'green'
  },
  chemical: {
    label: '化学品',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    color: 'purple'
  },
  biological: {
    label: '生物',
    className: 'bg-pink-50 text-pink-700 border-pink-200',
    color: 'pink'
  },
  other: {
    label: '其他',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    color: 'gray'
  }
}

/**
 * 获取状态徽章样式
 * @param status 状态值
 * @param customLabel 自定义标签
 * @returns 状态配置对象
 */
export const getStatusConfig = (status: string, customLabel?: string) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: customLabel || status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    color: 'gray'
  }
  
  return {
    ...config,
    label: customLabel || config.label
  }
}

/**
 * 获取优先级徽章样式
 * @param priority 优先级值
 * @param customLabel 自定义标签
 * @returns 优先级配置对象
 */
export const getPriorityConfig = (priority: string, customLabel?: string) => {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || {
    label: customLabel || priority,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    color: 'gray'
  }
  
  return {
    ...config,
    label: customLabel || config.label
  }
}

/**
 * 获取类型徽章样式
 * @param type 类型值
 * @param customLabel 自定义标签
 * @returns 类型配置对象
 */
export const getTypeConfig = (type: string, customLabel?: string) => {
  const config = typeConfig[type as keyof typeof typeConfig] || {
    label: customLabel || type,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    color: 'gray'
  }
  
  return {
    ...config,
    label: customLabel || config.label
  }
}

/**
 * 统一的徽章基础样式类
 */
export const badgeBaseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border'

/**
 * 统一的标签基础样式类
 */
export const tagBaseClasses = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border'

/**
 * 统一的按钮样式类
 */
export const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
  warning: 'bg-orange-600 hover:bg-orange-700 text-white border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent'
}

/**
 * 统一的卡片样式类
 */
export const cardClasses = 'bg-white rounded-lg shadow border border-gray-200'

/**
 * 统一的表格样式类
 */
export const tableClasses = {
  container: 'bg-white rounded-lg shadow border border-gray-200 overflow-hidden',
  header: 'bg-gray-50 border-b border-gray-200',
  row: 'border-b border-gray-200 hover:bg-gray-50',
  cell: 'px-6 py-4 text-sm text-gray-900'
}