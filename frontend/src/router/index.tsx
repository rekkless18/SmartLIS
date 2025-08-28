/**
 * 路由配置
 * 配置React Router 6路由系统，包含路由守卫、懒加载等
 * @author Erikwang
 * @date 2025-08-20
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import LoadingSpinner from '../components/LoadingSpinner'

// 懒加载页面组件
const Login = lazy(() => import('../pages/Login'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))
const EmailVerification = lazy(() => import('../pages/EmailVerification'))
const UserProfile = lazy(() => import('../pages/UserProfile'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const SubmissionList = lazy(() => import('../pages/Submission/SubmissionList'))
const SubmissionCreate = lazy(
  () => import('../pages/Submission/SubmissionCreate')
)
const SubmissionDetail = lazy(
  () => import('../pages/Submission/SubmissionDetail')
)
const SampleList = lazy(() => import('../pages/Sample/SampleList'))
const SampleReceive = lazy(() => import('../pages/Sample/SampleReceive'))
const SampleStorage = lazy(() => import('../pages/Sample/SampleStorage'))
const SampleDestroy = lazy(() => import('../pages/Sample/SampleDestroy'))
// 普检实验管理页面
const GeneralExperimentList = lazy(
  () => import('../pages/GeneralExperiment/GeneralExperimentList')
)
const GeneralDataEntry = lazy(
  () => import('../pages/GeneralExperiment/GeneralDataEntry')
)
const GeneralDataReview = lazy(
  () => import('../pages/GeneralExperiment/GeneralDataReview')
)
const GeneralExceptionHandle = lazy(
  () => import('../pages/GeneralExperiment/GeneralExceptionHandle')
)

// 质谱实验管理页面
const MassSpecList = lazy(() => import('../pages/MassSpec/MassSpecList'))
const MassSpecDataEntry = lazy(
  () => import('../pages/MassSpec/MassSpecDataEntry')
)
const MassSpecDataReview = lazy(
  () => import('../pages/MassSpec/MassSpecDataReview')
)
const QualityControl = lazy(() => import('../pages/MassSpec/QualityControl'))
const MassSpecExceptionHandle = lazy(
  () => import('../pages/MassSpec/MassSpecExceptionHandle')
)

// 特检实验管理页面
const WetLab = lazy(() => import('../pages/SpecialExperiment/WetLab'))
const MachineOperation = lazy(
  () => import('../pages/SpecialExperiment/MachineOperation')
)
const AnalysisInterpretation = lazy(
  () => import('../pages/SpecialExperiment/AnalysisInterpretation')
)
const ExceptionCenter = lazy(
  () => import('../pages/SpecialExperiment/ExceptionCenter')
)
const ReportList = lazy(() => import('../pages/Report/ReportList'))
const ReportEdit = lazy(() => import('../pages/Report/ReportEdit'))
const ReportReview = lazy(() => import('../pages/Report/ReportReview'))
const ReportTemplate = lazy(() => import('../pages/Report/ReportTemplate'))
const LabManagement = lazy(() => import('../pages/Lab/LabManagement'))
const EquipmentManagement = lazy(() => import('../pages/Lab/EquipmentManagement'))
const SuppliesManagement = lazy(() => import('../pages/Lab/SuppliesManagement'))
const BookingManagement = lazy(() => import('../pages/Lab/BookingManagement'))
const EnvironmentMonitor = lazy(
  () => import('../pages/Environment/EnvironmentMonitor')
)
const AccountManagement = lazy(() => import('../pages/User/AccountManagement'))
const RoleManagement = lazy(() => import('../pages/RoleManagement'))
const SystemSettings = lazy(() => import('../pages/Settings/SystemSettings'))
const Unauthorized = lazy(() => import('../pages/Unauthorized'))
const NotFound = lazy(() => import('../pages/NotFound'))

// 页面包装器，添加Suspense
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
)

// 路由配置
export const router = createBrowserRouter([
  // 根路径重定向到登录页
  {
    path: '/',
    element: <Navigate to='/login' replace />,
  },
  {
    path: '/login',
    element: (
      <PageWrapper>
        <Login />
      </PageWrapper>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PageWrapper>
        <ForgotPassword />
      </PageWrapper>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PageWrapper>
        <ResetPassword />
      </PageWrapper>
    ),
  },
  {
    path: '/email-verification',
    element: (
      <PageWrapper>
        <EmailVerification />
      </PageWrapper>
    ),
  },
  // 受保护的应用路由
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // 首页看板 - 直接页面
      {
        path: 'dashboard',
        element: (
          <PageWrapper>
            <Dashboard />
          </PageWrapper>
        ),
      },
      // 送检管理 - 一级模块，包含二级页面
      {
        path: 'submission',
        children: [
          {
            index: true,
            element: <Navigate to='/submission/list' replace />,
          },
          {
            path: 'list',
            element: (
              <PageWrapper>
                <SubmissionList />
              </PageWrapper>
            ),
          },
          {
            path: 'create',
            element: (
              <PageWrapper>
                <SubmissionCreate />
              </PageWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <PageWrapper>
                <SubmissionDetail />
              </PageWrapper>
            ),
          },
        ],
      },
      // 样本管理 - 一级模块，包含二级页面
      {
        path: 'sample',
        children: [
          {
            index: true,
            element: <Navigate to='/sample/list' replace />,
          },
          {
            path: 'list',
            element: (
              <PageWrapper>
                <SampleList />
              </PageWrapper>
            ),
          },
          {
            path: 'receive',
            element: (
              <PageWrapper>
                <SampleReceive />
              </PageWrapper>
            ),
          },
          {
            path: 'storage',
            element: (
              <PageWrapper>
                <SampleStorage />
              </PageWrapper>
            ),
          },
          {
            path: 'destroy',
            element: (
              <PageWrapper>
                <SampleDestroy />
              </PageWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <PageWrapper>
                <SampleList />
              </PageWrapper>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <PageWrapper>
                <SampleReceive />
              </PageWrapper>
            ),
          },
        ],
      },
      // 普检实验管理 - 一级模块，包含二级页面
      {
        path: 'general-experiment',
        children: [
          {
            index: true,
            element: <Navigate to='/general-experiment/list' replace />,
          },
          {
            path: 'list',
            element: (
              <PageWrapper>
                <GeneralExperimentList />
              </PageWrapper>
            ),
          },
          {
            path: 'data-entry',
            element: (
              <PageWrapper>
                <GeneralDataEntry />
              </PageWrapper>
            ),
          },
          {
            path: 'data-review',
            element: (
              <PageWrapper>
                <GeneralDataReview />
              </PageWrapper>
            ),
          },
          {
            path: 'exception-handle',
            element: (
              <PageWrapper>
                <GeneralExceptionHandle />
              </PageWrapper>
            ),
          },
        ],
      },
      // 质谱实验管理 - 一级模块，包含二级页面
      {
        path: 'mass-spec',
        children: [
          {
            index: true,
            element: <Navigate to='/mass-spec/list' replace />,
          },
          {
            path: 'list',
            element: (
              <PageWrapper>
                <MassSpecList />
              </PageWrapper>
            ),
          },
          {
            path: 'data-entry',
            element: (
              <PageWrapper>
                <MassSpecDataEntry />
              </PageWrapper>
            ),
          },
          {
            path: 'data-review',
            element: (
              <PageWrapper>
                <MassSpecDataReview />
              </PageWrapper>
            ),
          },
          {
            path: 'quality-control',
            element: (
              <PageWrapper>
                <QualityControl />
              </PageWrapper>
            ),
          },
          {
            path: 'exception-handle',
            element: (
              <PageWrapper>
                <MassSpecExceptionHandle />
              </PageWrapper>
            ),
          },
        ],
      },
      // 特检实验管理 - 一级模块，包含二级页面
      {
        path: 'special-experiment',
        children: [
          {
            index: true,
            element: <Navigate to='/special-experiment/wet-lab' replace />,
          },
          {
            path: 'wet-lab',
            element: (
              <PageWrapper>
                <WetLab />
              </PageWrapper>
            ),
          },
          {
            path: 'machine-operation',
            element: (
              <PageWrapper>
                <MachineOperation />
              </PageWrapper>
            ),
          },
          {
            path: 'analysis-interpretation',
            element: (
              <PageWrapper>
                <AnalysisInterpretation />
              </PageWrapper>
            ),
          },
          {
            path: 'exception-center',
            element: (
              <PageWrapper>
                <ExceptionCenter />
              </PageWrapper>
            ),
          },
        ],
      },
      // 报告管理 - 一级模块，包含二级页面
      {
        path: 'report',
        children: [
          {
            index: true,
            element: <Navigate to='/report/list' replace />,
          },
          {
            path: 'list',
            element: (
              <PageWrapper>
                <ReportList />
              </PageWrapper>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <PageWrapper>
                <ReportEdit />
              </PageWrapper>
            ),
          },
          {
            path: 'create',
            element: (
              <PageWrapper>
                <ReportEdit />
              </PageWrapper>
            ),
          },
          {
            path: 'review',
            element: (
              <PageWrapper>
                <ReportReview />
              </PageWrapper>
            ),
          },
          {
            path: 'template',
            element: (
              <PageWrapper>
                <ReportTemplate />
              </PageWrapper>
            ),
          },
          {
            path: 'detail/:id',
            element: (
              <PageWrapper>
                <ReportList />
              </PageWrapper>
            ),
          },
        ],
      },
      // 实验室管理 - 一级模块，包含二级页面
      {
        path: 'lab',
        children: [
          {
            index: true,
            element: <Navigate to='/lab/management' replace />,
          },
          {
            path: 'management',
            element: (
              <PageWrapper>
                <LabManagement />
              </PageWrapper>
            ),
          },
          {
            path: 'equipment',
            element: (
              <PageWrapper>
                <EquipmentManagement />
              </PageWrapper>
            ),
          },
          {
            path: 'supplies',
            element: (
              <PageWrapper>
                <SuppliesManagement />
              </PageWrapper>
            ),
          },
          {
            path: 'booking',
            element: (
              <PageWrapper>
                <BookingManagement />
              </PageWrapper>
            ),
          },
        ],
      },
      // 环境管理 - 一级模块，包含二级页面
      {
        path: 'environment',
        children: [
          {
            index: true,
            element: <Navigate to='/environment/monitor' replace />,
          },
          {
            path: 'monitor',
            element: (
              <PageWrapper>
                <EnvironmentMonitor />
              </PageWrapper>
            ),
          },
        ],
      },
      // 个人中心
      {
        path: 'profile',
        element: (
          <PageWrapper>
            <UserProfile />
          </PageWrapper>
        ),
      },
      // 用户管理 - 一级模块，包含二级页面
      {
        path: 'user',
        children: [
          {
            index: true,
            element: <Navigate to='/user/account' replace />,
          },
          {
            path: 'account',
            element: (
              <ProtectedRoute requiredPermission='user:manage'>
                <PageWrapper>
                  <AccountManagement />
                </PageWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'role',
            element: (
              <ProtectedRoute requiredPermission='role:manage'>
                <PageWrapper>
                  <RoleManagement />
                </PageWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
      // 系统设置 - 一级模块，包含二级页面
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: <Navigate to='/settings/system' replace />,
          },
          {
            path: 'system',
            element: (
              <ProtectedRoute requiredRole='admin'>
                <PageWrapper>
                  <SystemSettings />
                </PageWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  // 无权限访问页面
  {
    path: '/unauthorized',
    element: (
      <PageWrapper>
        <Unauthorized />
      </PageWrapper>
    ),
  },
  {
    path: '*',
    element: (
      <PageWrapper>
        <NotFound />
      </PageWrapper>
    ),
  },
])

export default router
