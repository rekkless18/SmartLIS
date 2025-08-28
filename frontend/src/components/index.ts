/**
 * 通用组件导出文件
 * 统一导出所有通用组件
 * @author Erikwang
 * @date 2025-08-20
 */

// 布局组件
export { default as Layout } from './Layout'

// 数据展示组件
export { default as DataTable } from './DataTable'
export type { DataTableProps, TableColumn, TableAction } from './DataTable'

// 表单组件
export { default as FormBuilder } from './FormBuilder'
export type {
  FormBuilderProps,
  FormField,
  FormFieldType,
  FormFieldOption,
  FormFieldRule,
  FormLayout,
} from './FormBuilder'

// 反馈组件
export { default as Modal, ConfirmModal } from './Modal'
export type { ModalProps, ConfirmModalProps } from './Modal'

export { default as Drawer } from './Drawer'
export type { DrawerProps } from './Drawer'

export {
  default as Loading,
  PageLoading,
  ButtonLoading,
  InlineLoading,
} from './Loading'
export type { LoadingProps } from './Loading'

// 导航组件
export { default as Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'
