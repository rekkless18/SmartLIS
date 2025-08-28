/**
 * 通用表单构建器组件
 * 支持动态表单生成、验证、布局等功能
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Calendar, Upload } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * 表单字段类型
 */
export type FormFieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'file'
  | 'switch'

/**
 * 表单字段选项
 */
export interface FormFieldOption {
  label: string
  value: any
  disabled?: boolean
}

/**
 * 表单字段验证规则
 */
export interface FormFieldRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any, formData: Record<string, any>) => string | null
  message?: string
}

/**
 * 表单字段配置
 */
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  defaultValue?: any
  options?: FormFieldOption[]
  rules?: FormFieldRule[]
  disabled?: boolean
  hidden?: boolean
  span?: number // 栅格占用列数 (1-24)
  tooltip?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onChange?: (value: any, formData: Record<string, any>) => void
}

/**
 * 表单布局配置
 */
export interface FormLayout {
  labelCol?: number // 标签占用列数
  wrapperCol?: number // 控件占用列数
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'middle' | 'large'
}

/**
 * 表单组件属性
 */
export interface FormBuilderProps {
  fields: FormField[]
  initialValues?: Record<string, any>
  layout?: FormLayout
  onSubmit?: (values: Record<string, any>) => void
  onValuesChange?: (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => void
  loading?: boolean
  disabled?: boolean
  className?: string
  submitText?: string
  resetText?: string
  showSubmit?: boolean
  showReset?: boolean
  wrapWithForm?: boolean
  compact?: boolean
}

/**
 * 表单验证错误
 */
interface FormErrors {
  [key: string]: string
}

/**
 * 通用表单构建器组件
 * @param props 组件属性
 * @returns 表单组件
 */
const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  initialValues = {},
  layout = { layout: 'vertical', size: 'middle' },
  onSubmit,
  onValuesChange,
  loading = false,
  disabled = false,
  className,
  submitText = '提交',
  resetText = '重置',
  showSubmit = true,
  showReset = false,
  wrapWithForm = true,
  compact = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  )

  // 初始化表单数据
  useEffect(() => {
    const defaultData: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue
      }
    })
    setFormData(prev => {
      const newData = { ...defaultData, ...initialValues }
      // 只有在数据真正变化时才更新
      const hasChanged =
        Object.keys(newData).some(key => newData[key] !== prev[key]) ||
        Object.keys(prev).some(key => !(key in newData))
      return hasChanged ? newData : prev
    })
  }, [])

  /**
   * 验证单个字段
   * @param field 字段配置
   * @param value 字段值
   * @returns 错误信息
   */
  const validateField = (field: FormField, value: any): string | null => {
    if (!field.rules) return null

    for (const rule of field.rules) {
      // 必填验证
      if (
        rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        return rule.message || `${field.label}是必填项`
      }

      // 跳过空值的其他验证
      if (value === undefined || value === null || value === '') {
        continue
      }

      // 最小值/长度验证
      if (rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          return rule.message || `${field.label}最少${rule.min}个字符`
        }
        if (typeof value === 'number' && value < rule.min) {
          return rule.message || `${field.label}最小值为${rule.min}`
        }
      }

      // 最大值/长度验证
      if (rule.max !== undefined) {
        if (typeof value === 'string' && value.length > rule.max) {
          return rule.message || `${field.label}最多${rule.max}个字符`
        }
        if (typeof value === 'number' && value > rule.max) {
          return rule.message || `${field.label}最大值为${rule.max}`
        }
      }

      // 正则验证
      if (
        rule.pattern &&
        typeof value === 'string' &&
        !rule.pattern.test(value)
      ) {
        return rule.message || `${field.label}格式不正确`
      }

      // 自定义验证
      if (rule.validator) {
        const error = rule.validator(value, formData)
        if (error) return error
      }
    }

    return null
  }

  /**
   * 验证所有字段
   * @returns 是否验证通过
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let hasError = false

    fields.forEach(field => {
      if (field.hidden) return

      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
        hasError = true
      }
    })

    setErrors(newErrors)
    return !hasError
  }

  /**
   * 处理字段值变化
   * @param name 字段名
   * @param value 字段值
   */
  const handleFieldChange = (name: string, value: any) => {
    const newFormData = { ...formData, [name]: value }
    setFormData(newFormData)

    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // 触发字段变化回调
    const field = fields.find(f => f.name === name)
    field?.onChange?.(value, newFormData)

    // 触发表单变化回调
    onValuesChange?.({ [name]: value }, newFormData)
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit?.(formData)
    }
  }

  /**
   * 处理表单重置
   */
  const handleReset = () => {
    setFormData(initialValues)
    setErrors({})
  }

  /**
   * 切换密码显示状态
   * @param fieldName 字段名
   */
  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  /**
   * 渲染表单字段
   * @param field 字段配置
   * @returns 字段组件
   */
  const renderField = (field: FormField) => {
    if (field.hidden) return null

    const value = formData[field.name]
    const error = errors[field.name]
    const fieldDisabled = disabled || field.disabled

    const fieldProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      disabled: fieldDisabled,
      className: cn(
        'w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
        fieldDisabled && 'bg-gray-100 cursor-not-allowed',
        compact ? 'px-2 py-1 text-sm' : 'px-3 py-2',
        layout.size === 'small' && 'px-2 py-1 text-sm',
        layout.size === 'large' && 'px-4 py-3 text-lg'
      ),
    }

    let fieldElement: React.ReactNode

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        fieldElement = (
          <input
            {...fieldProps}
            type={field.type}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
          />
        )
        break

      case 'password':
        const showPassword = showPasswords[field.name]
        fieldElement = (
          <div className='relative'>
            <input
              {...fieldProps}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              className={cn(fieldProps.className, 'pr-10')}
            />
            <button
              type='button'
              onClick={() => togglePasswordVisibility(field.name)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              {showPassword ? (
                <EyeOff className='w-4 h-4' />
              ) : (
                <Eye className='w-4 h-4' />
              )}
            </button>
          </div>
        )
        break

      case 'textarea':
        fieldElement = (
          <textarea
            {...fieldProps}
            rows={4}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
          />
        )
        break

      case 'select':
        fieldElement = (
          <select
            {...fieldProps}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
          >
            <option value=''>{field.placeholder || '请选择'}</option>
            {field.options?.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        )
        break

      case 'radio':
        fieldElement = (
          <div className='space-y-2'>
            {field.options?.map(option => (
              <label key={option.value} className='flex items-center space-x-2'>
                <input
                  type='radio'
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={fieldDisabled || option.disabled}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  className='text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>{option.label}</span>
              </label>
            ))}
          </div>
        )
        break

      case 'checkbox':
        if (field.options) {
          // 多选框组
          fieldElement = (
            <div className='space-y-2'>
              {field.options.map(option => (
                <label
                  key={option.value}
                  className='flex items-center space-x-2'
                >
                  <input
                    type='checkbox'
                    value={option.value}
                    checked={
                      Array.isArray(value) && value.includes(option.value)
                    }
                    disabled={fieldDisabled || option.disabled}
                    onChange={e => {
                      const currentValue = Array.isArray(value) ? value : []
                      if (e.target.checked) {
                        handleFieldChange(field.name, [
                          ...currentValue,
                          option.value,
                        ])
                      } else {
                        handleFieldChange(
                          field.name,
                          currentValue.filter(v => v !== option.value)
                        )
                      }
                    }}
                    className='text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>{option.label}</span>
                </label>
              ))}
            </div>
          )
        } else {
          // 单个复选框
          fieldElement = (
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={!!value}
                disabled={fieldDisabled}
                onChange={e => handleFieldChange(field.name, e.target.checked)}
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>{field.placeholder}</span>
            </label>
          )
        }
        break

      case 'switch':
        fieldElement = (
          <button
            type='button'
            onClick={() =>
              !fieldDisabled && handleFieldChange(field.name, !value)
            }
            disabled={fieldDisabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              value ? 'bg-blue-600' : 'bg-gray-200',
              fieldDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                value ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        )
        break

      case 'date':
      case 'datetime':
        fieldElement = (
          <div className='relative'>
            <input
              {...fieldProps}
              type={field.type === 'date' ? 'date' : 'datetime-local'}
              value={value || ''}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              className={cn(fieldProps.className, 'pr-10')}
            />
            <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          </div>
        )
        break

      case 'file':
        fieldElement = (
          <div className='space-y-2'>
            <input
              {...fieldProps}
              type='file'
              onChange={e => handleFieldChange(field.name, e.target.files?.[0])}
              className='hidden'
            />
            <div
              onClick={() =>
                !fieldDisabled && document.getElementById(field.name)?.click()
              }
              className={cn(
                'border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400',
                fieldDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Upload className='w-8 h-8 mx-auto text-gray-400 mb-2' />
              <p className='text-sm text-gray-600'>
                {value ? value.name : field.placeholder || '点击上传文件'}
              </p>
            </div>
          </div>
        )
        break

      default:
        fieldElement = (
          <input
            {...fieldProps}
            type='text'
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
          />
        )
    }

    return (
      <div
        key={field.name}
        className={cn(
          'form-field',
          layout.layout === 'inline' && 'inline-block mr-4',
          field.span && `col-span-${field.span}`
        )}
      >
        {/* 字段标签 */}
        {field.label && (
          <label
            htmlFor={field.name}
            className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs mb-1' : 'text-sm',
              layout.layout === 'horizontal' && 'text-right',
              layout.layout === 'vertical' && 'mb-1',
              layout.layout === 'inline' && 'inline-block mr-2'
            )}
          >
            {field.label}
            {field.rules?.some(rule => rule.required) && (
              <span className='text-red-500 ml-1'>*</span>
            )}
          </label>
        )}

        {/* 字段控件 */}
        <div className={cn(layout.layout === 'inline' && 'inline-block')}>
          {field.prefix || field.suffix ? (
            <div className='relative'>
              {field.prefix && (
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                  {field.prefix}
                </div>
              )}
              <div
                className={cn(field.prefix && 'pl-10', field.suffix && 'pr-10')}
              >
                {fieldElement}
              </div>
              {field.suffix && (
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  {field.suffix}
                </div>
              )}
            </div>
          ) : (
            fieldElement
          )}

          {/* 错误信息 */}
          {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

          {/* 提示信息 */}
          {field.tooltip && !error && (
            <p className='mt-1 text-sm text-gray-500'>{field.tooltip}</p>
          )}
        </div>
      </div>
    )
  }

  const formContent = (
    <>
      {/* 表单字段 */}
      <div
        className={cn(
          layout.layout === 'horizontal' &&
            (compact ? 'space-y-2' : 'space-y-4'),
          layout.layout === 'vertical' && (compact ? 'space-y-2' : 'space-y-4'),
          layout.layout === 'inline' && 'space-x-4'
        )}
      >
        {fields.map(renderField)}
      </div>

      {/* 表单按钮 */}
      {(showSubmit || showReset) && (
        <div
          className={cn(
            'flex space-x-4 pt-4',
            layout.layout === 'horizontal' && 'ml-auto'
          )}
        >
          {showReset && (
            <button
              type='button'
              onClick={handleReset}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {resetText}
            </button>
          )}
          {showSubmit && (
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '提交中...' : submitText}
            </button>
          )}
        </div>
      )}
    </>
  )

  if (wrapWithForm) {
    return (
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {formContent}
      </form>
    )
  }

  return <div className={cn('space-y-4', className)}>{formContent}</div>
}

export default FormBuilder
