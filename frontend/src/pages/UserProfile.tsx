/**
 * 用户信息管理页面
 * 用户可以查看和编辑个人信息，修改密码
 * @author Erikwang
 * @date 2025-08-20
 */

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/auth'
import { AuthService } from '../lib/auth'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

/**
 * 用户信息表单数据接口
 */
interface UserProfileForm {
  username: string
  realName: string
  email: string
  phone: string
  department: string
  position: string
}

/**
 * 密码修改表单数据接口
 */
interface PasswordChangeForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * 表单验证错误接口
 */
interface FormErrors {
  username?: string
  realName?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

/**
 * 用户信息管理页面组件
 * @returns 用户信息管理页面
 */
const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState<UserProfileForm>({
    username: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  })
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // 初始化表单数据
    if (user) {
      setProfileForm({
        username: user.username || '',
        realName: user.realName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
      })
    }
  }, [user])

  /**
   * 处理个人信息表单输入变化
   * @param field 字段名
   * @param value 字段值
   */
  const handleProfileInputChange = (
    field: keyof UserProfileForm,
    value: string
  ) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 清除通用错误信息
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
    // 清除成功信息
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  /**
   * 处理密码表单输入变化
   * @param field 字段名
   * @param value 字段值
   */
  const handlePasswordInputChange = (
    field: keyof PasswordChangeForm,
    value: string
  ) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 清除通用错误信息
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
    // 清除成功信息
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  /**
   * 验证个人信息表单
   * @returns 验证结果
   */
  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 验证用户名
    if (!profileForm.username) {
      newErrors.username = '请输入用户名'
    } else if (profileForm.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符'
    }

    // 验证真实姓名
    if (!profileForm.realName) {
      newErrors.realName = '请输入真实姓名'
    } else if (profileForm.realName.length < 2) {
      newErrors.realName = '真实姓名至少需要2个字符'
    }

    // 验证邮箱
    if (!profileForm.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 验证手机号（可选）
    if (profileForm.phone && !/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      newErrors.phone = '请输入有效的手机号码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 验证密码修改表单
   * @returns 验证结果
   */
  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 验证当前密码
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = '请输入当前密码'
    }

    // 验证新密码
    if (!passwordForm.newPassword) {
      newErrors.newPassword = '请输入新密码'
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = '新密码至少需要6个字符'
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)
    ) {
      newErrors.newPassword = '新密码需要包含大小写字母和数字'
    }

    // 验证确认密码
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    // 检查新密码是否与当前密码相同
    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      newErrors.newPassword = '新密码不能与当前密码相同'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 处理个人信息保存
   * @param e 表单事件
   */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!validateProfileForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      if (!user) {
        setErrors({ general: '用户信息不存在' })
        return
      }

      // 更新用户信息到数据库
      const { error } = await supabase
        .from('users')
        .update({
          username: profileForm.username,
          real_name: profileForm.realName,
          email: profileForm.email,
          phone: profileForm.phone || null,
          department: profileForm.department || null,
          position: profileForm.position || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        setErrors({ general: '更新用户信息失败，请重试' })
        return
      }

      // 更新本地用户状态
      const updatedUser = {
        ...user,
        username: profileForm.username,
        realName: profileForm.realName,
        email: profileForm.email,
        phone: profileForm.phone,
        department: profileForm.department,
        position: profileForm.position,
        updatedAt: new Date().toISOString(),
      }

      updateUser(updatedUser)
      setSuccessMessage('个人信息更新成功')
    } catch (_err) {
      setErrors({ general: '网络错误，请检查网络连接' })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 处理密码修改
   * @param e 表单事件
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!validatePasswordForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // 先验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        setErrors({ currentPassword: '当前密码不正确' })
        return
      }

      // 更新密码
      const response = await AuthService.updatePassword(
        passwordForm.newPassword
      )

      if (response.error) {
        setErrors({ general: response.error })
      } else {
        setSuccessMessage('密码修改成功')
        // 清空密码表单
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (_err) {
      setErrors({ general: '网络错误，请检查网络连接' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* 页面标题 */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>个人中心</h1>
        <p className='text-gray-600'>管理您的个人信息和账户设置</p>
      </div>

      {/* 标签页导航 */}
      <div className='border-b border-gray-200 mb-8'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            个人信息
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            修改密码
          </button>
        </nav>
      </div>

      {/* 成功信息 */}
      {successMessage && (
        <div className='mb-6 bg-green-50 border border-green-200 rounded-md p-4'>
          <div className='flex items-center text-green-600'>
            <CheckCircle className='h-5 w-5 mr-2' />
            {successMessage}
          </div>
        </div>
      )}

      {/* 个人信息标签页 */}
      {activeTab === 'profile' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <form onSubmit={handleProfileSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* 用户名 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  用户名 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    value={profileForm.username}
                    onChange={e =>
                      handleProfileInputChange('username', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.username
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入用户名'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.username}
                  </div>
                )}
              </div>

              {/* 真实姓名 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  真实姓名 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    value={profileForm.realName}
                    onChange={e =>
                      handleProfileInputChange('realName', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.realName
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入真实姓名'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.realName && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.realName}
                  </div>
                )}
              </div>

              {/* 邮箱地址 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  邮箱地址 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='email'
                    value={profileForm.email}
                    onChange={e =>
                      handleProfileInputChange('email', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入邮箱地址'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* 手机号码 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  手机号码
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Phone className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='tel'
                    value={profileForm.phone}
                    onChange={e =>
                      handleProfileInputChange('phone', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入手机号码'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* 部门 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  部门
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Building className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    value={profileForm.department}
                    onChange={e =>
                      handleProfileInputChange('department', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入部门'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.department && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.department}
                  </div>
                )}
              </div>

              {/* 职位 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  职位
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Briefcase className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    value={profileForm.position}
                    onChange={e =>
                      handleProfileInputChange('position', e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.position
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入职位'
                    disabled={isSubmitting}
                  />
                </div>
                {errors.position && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.position}
                  </div>
                )}
              </div>
            </div>

            {/* 通用错误信息 */}
            {errors.general && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                <div className='flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {errors.general}
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isSubmitting ? (
                  <LoadingSpinner size='sm' text='' inline />
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    保存更改
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 修改密码标签页 */}
      {activeTab === 'password' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <form onSubmit={handlePasswordSubmit} className='space-y-6'>
            <div className='max-w-md'>
              {/* 当前密码 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  当前密码 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      handlePasswordInputChange(
                        'currentPassword',
                        e.target.value
                      )
                    }
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.currentPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入当前密码'
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    disabled={isSubmitting}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400' />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.currentPassword}
                  </div>
                )}
              </div>

              {/* 新密码 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  新密码 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e =>
                      handlePasswordInputChange('newPassword', e.target.value)
                    }
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请输入新密码'
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400' />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.newPassword}
                  </div>
                )}
              </div>

              {/* 确认新密码 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  确认新密码 *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      handlePasswordInputChange(
                        'confirmPassword',
                        e.target.value
                      )
                    }
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder='请再次输入新密码'
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className='mt-1 flex items-center text-red-600 text-sm'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* 通用错误信息 */}
            {errors.general && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                <div className='flex items-center text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {errors.general}
                </div>
              </div>
            )}

            {/* 密码要求提示 */}
            <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
              <div className='text-blue-800 text-sm'>
                <p className='font-medium mb-1'>密码要求：</p>
                <ul className='list-disc list-inside space-y-1 text-xs'>
                  <li>至少6个字符</li>
                  <li>包含大写字母</li>
                  <li>包含小写字母</li>
                  <li>包含数字</li>
                </ul>
              </div>
            </div>

            {/* 修改密码按钮 */}
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isSubmitting ? (
                  <LoadingSpinner size='sm' text='' inline />
                ) : (
                  <>
                    <Lock className='h-4 w-4 mr-2' />
                    修改密码
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default UserProfile
