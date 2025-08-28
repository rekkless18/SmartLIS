import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import ToggleSwitch from '@/components/ToggleSwitch';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import { Dialog } from '../components/ui/dialog';
import { Search, Plus, Edit, Trash2, Shield, Users } from 'lucide-react';
import { RoleService, Role, PermissionService, Permission } from '../services/userService';
import { useAuthStore } from '../stores/auth';
import { toast } from 'sonner';

// 使用从userService导入的Role和Permission接口

// 权限数据缓存
let permissionsCache: Permission[] | null = null;
let permissionsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

const RoleManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    status: true // 默认启用状态
  });

  // 加载角色数据
  const loadRoles = async () => {
    try {
      const response = await RoleService.getRoles();
      setRoles(response.data);
    } catch (error: any) {
      console.error('加载角色数据失败:', error);
      toast.error('加载角色数据失败');
    }
  };

  // 防抖搜索效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 优化的权限数据加载函数（带缓存）
  const loadPermissions = useCallback(async (): Promise<boolean> => {
    // 检查缓存是否有效
    const now = Date.now();
    if (permissionsCache && (now - permissionsCacheTime) < CACHE_DURATION) {
      setPermissions(permissionsCache);
      return true;
    }

    try {
      setPermissionsLoading(true);
      const response = await PermissionService.getGroupedPermissions();
      // 将分组权限展平为单个权限数组
      const flatPermissions: Permission[] = [];
      response.forEach(group => {
        flatPermissions.push(...group.permissions);
      });
      
      // 更新缓存
      permissionsCache = flatPermissions;
      permissionsCacheTime = now;
      
      setPermissions(flatPermissions);
      return true;
    } catch (error: any) {
      console.error('加载权限数据失败:', error);
      // 静默处理，不显示任何提示
      return false;
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  // 加载角色数据
  const loadData = async () => {
    try {
      setDataLoading(true);
      await loadRoles();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: boolean) => {
    return status ? '启用' : '禁用';
  };

  // 过滤角色（使用防抖搜索词和useMemo优化）
  const filteredRoles = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return roles;
    }
    const searchLower = debouncedSearchTerm.toLowerCase();
    return roles.filter(role =>
      role.display_name.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower)
    );
  }, [roles, debouncedSearchTerm]);

  // 处理添加角色
  const handleAddRole = async () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      status: true // 默认启用状态
    });
    
    // 静默加载权限数据（如果还没有加载）
    if (permissions.length === 0) {
      await loadPermissions();
      // 不显示任何提示，静默处理
    }
    
    setIsEditModalOpen(true);
  };

  // 处理编辑角色
  const handleEditRole = async (role: Role) => {
    setEditingRole(role);
    
    // 先设置基本信息，确保弹窗能正常打开
    setFormData({
      name: role.display_name,
      description: role.description,
      status: role.status,
      permissions: []
    });
    
    // 静默加载权限数据（如果还没有加载）
    let permissionsAvailable = permissions.length > 0;
    if (!permissionsAvailable) {
      permissionsAvailable = await loadPermissions();
      // 不显示任何提示，静默处理
    }
    
    // 尝试获取角色的权限列表
    if (permissionsAvailable) {
      try {
        const rolePermissions = await RoleService.getRolePermissions(role.id);
        const permissionIds = rolePermissions.map(p => p.id);
        
        setFormData(prev => ({
          ...prev,
          permissions: permissionIds
        }));
      } catch (error: any) {
        console.error('加载角色权限失败:', error);
        // 静默处理，不显示任何提示
      }
    }
    
    setIsEditModalOpen(true);
  };

  // 处理删除角色（使用useCallback优化）
  const handleDeleteRole = useCallback(async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    
    if (role && role.userCount && role.userCount > 0) {
      toast.error('该角色下还有用户，无法删除');
      return;
    }

    if (!confirm('确定要删除该角色吗？')) {
      return;
    }
    
    try {
      await RoleService.deleteRole(roleId);
      toast.success('角色删除成功');
      
      // 局部更新而非重新加载所有数据
      setRoles(prevRoles => prevRoles.filter(r => r.id !== roleId));
    } catch (error: any) {
      console.error('删除角色失败:', error);
      toast.error(error.message || '删除角色失败');
    }
  }, [roles]);

  // 处理状态切换（使用useCallback优化）
  const handleToggleStatus = useCallback(async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const newStatus = !role.status; // 布尔值取反
    
    try {
      await RoleService.updateRole(roleId, { status: newStatus });
      toast.success('角色状态更新成功');
      
      // 局部更新而非重新加载所有数据
      setRoles(prevRoles => 
        prevRoles.map(r => 
          r.id === roleId ? { ...r, status: newStatus } : r
        )
      );
    } catch (error: any) {
      console.error('更新角色状态失败:', error);
      toast.error(error.message || '更新角色状态失败');
    }
  }, [roles]);

  // 处理保存角色
  const handleSaveRole = async () => {
    // 系统角色保护检查
    if (editingRole?.is_system) {
      toast.error('系统角色不允许修改');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('请输入角色名称');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('请输入角色描述');
      return;
    }
    // 只有在权限数据可用时才验证权限选择
    if (permissions.length > 0 && formData.permissions.length === 0) {
      toast.error('请至少选择一个权限');
      return;
    }
    // 如果权限数据不可用，允许创建角色但给出提示
    if (permissions.length === 0 && !editingRole) {
      if (!confirm('权限数据暂时无法加载，创建的角色将不包含任何权限。是否继续创建？')) {
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (editingRole) {
        // 编辑角色
        await RoleService.updateRole(editingRole.id, {
          display_name: formData.name,
          description: formData.description
        });
        
        // 更新角色权限
        if (permissions.length > 0) {
          await RoleService.assignRolePermissions(editingRole.id, formData.permissions);
        }
        
        toast.success('角色更新成功');
      } else {
        // 添加角色
        await RoleService.createRole({
          name: formData.name, // 系统内部标识
          display_name: formData.name, // 显示名称
          description: formData.description,
          permissionIds: formData.permissions
        });
        toast.success('角色创建成功');
      }
      
      setIsEditModalOpen(false);
      
      // 局部更新而非重新加载所有数据
      if (editingRole) {
        // 更新现有角色
        setRoles(prevRoles => 
          prevRoles.map(r => 
            r.id === editingRole.id 
              ? { ...r, display_name: formData.name, description: formData.description }
              : r
          )
        );
      } else {
        // 添加新角色时仍需重新加载以获取完整数据
        loadRoles();
      }
    } catch (error: any) {
      console.error('保存角色失败:', error);
      toast.error(error.message || '保存角色失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理权限选择
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId]
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permissionId)
      });
    }
  };

  // 按实际侧导航结构分组权限（使用useMemo缓存）
  const sortedGroupedPermissions = useMemo(() => {
    if (permissions.length === 0) {
      return {};
    }

    const groupedPermissions = permissions.reduce((groups, permission) => {
      // 根据权限代码映射到对应的导航模块
      let module = '其他';
      const code = permission.code;
      
      if (code.startsWith('dashboard.')) {
        module = '首页看板';
      } else if (code.startsWith('submission.')) {
        module = '送检管理';
      } else if (code.startsWith('sample.')) {
        module = '样本管理';
      } else if (code.startsWith('routine.')) {
        module = '普检实验管理';
      } else if (code.startsWith('mass_spec.')) {
        module = '质谱实验管理';
      } else if (code.startsWith('special.')) {
        module = '特检实验管理';
      } else if (code.startsWith('report.')) {
        module = '报告管理';
      } else if (code.startsWith('lab.')) {
        module = '实验室管理';
      } else if (code.startsWith('environment.')) {
        module = '环境管理';
      } else if (code.startsWith('user.') || code.startsWith('role.')) {
        module = '用户管理';
      } else if (code.startsWith('settings.') || code.startsWith('permission.')) {
        module = '系统设置';
      }
      
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);

    // 按照侧导航的顺序排序模块
    const moduleOrder = [
      '首页看板',
      '送检管理', 
      '样本管理',
      '普检实验管理',
      '质谱实验管理', 
      '特检实验管理',
      '报告管理',
      '实验室管理',
      '环境管理',
      '用户管理',
      '系统设置',
      '其他'
    ];
    
    return Object.keys(groupedPermissions)
      .sort((a, b) => {
        const indexA = moduleOrder.indexOf(a);
        const indexB = moduleOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .reduce((sorted, key) => {
        sorted[key] = groupedPermissions[key];
        return sorted;
      }, {} as Record<string, Permission[]>);
  }, [permissions]);

  // 角色表格列配置
  const columns = [
    {
      key: 'display_name',
      title: '角色名称',
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{role.display_name}</span>
        </div>
      )
    },
    {
      key: 'description',
      title: '描述',
      render: (role: Role) => (
        <span className="text-gray-600">{role.description}</span>
      )
    },
    {
      key: 'permissions',
      title: '权限数量',
      render: (role: Role) => (
        <Badge variant="outline">
          {role.permissions.length} 个权限
        </Badge>
      )
    },
    {
      key: 'userCount',
      title: '用户数量',
      render: (role: Role) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{role.userCount}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: '状态',
      render: (role: Role) => (
        <Badge className={getStatusColor(role.status)}>
          {getStatusText(role.status)}
        </Badge>
      )
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      render: (role: Role) => (
        <span className="text-gray-500">{role.updatedAt}</span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRole(role)}
            title={role.is_system ? '查看系统角色详情' : '编辑角色'}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {!role.is_system && (
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={role.status}
                onChange={() => handleToggleStatus(role.id)}
                size="sm"
                showLabel={false}
              />
            </div>
          )}
          {!role.is_system && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('🔥 [DEBUG] 删除按钮被点击，角色ID:', role.id, '角色信息:', role);
                handleDeleteRole(role.id);
              }}
              className="text-red-600 hover:text-red-700"
              title="删除角色"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {role.is_system && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                系统角色
              </span>
            </div>
          )}
        </div>
      )
    }
  ];

  if (dataLoading) {
    return (
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
          <p className="text-gray-600 mt-1">管理系统角色和权限配置</p>
        </div>

        {/* 搜索和操作栏 */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </Card>

        {/* 角色列表骨架屏 */}
        <Card>
          <div className="p-6">
            <SkeletonLoader rows={6} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">


      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
        <p className="text-gray-600 mt-1">管理系统角色和权限配置</p>
      </div>

      {/* 搜索和操作栏 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索角色名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
                  </div>
          </div>
          <Button onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-2" />
            添加角色
          </Button>
        </div>
      </Card>

      {/* 角色列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render(role)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 编辑角色对话框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRole ? '编辑角色' : '添加角色'}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色名称 *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入角色名称"
            />
                </div>
                
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色描述 *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入角色描述"
            />
                </div>

                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={formData.status ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">启用</option>
              <option value="false">禁用</option>
            </select>
                </div>

                <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              权限配置 {editingRole?.is_system ? '(系统角色权限仅供查看)' : '*'}
            </label>
            {editingRole?.is_system ? (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">系统角色权限配置</p>
                  <p className="text-sm text-gray-500">系统角色的权限配置由系统管理，不可修改</p>
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium text-gray-700 mb-2">当前权限数量：{editingRole.permissions?.length || 0} 个</p>
                    <div className="flex flex-wrap gap-1">
                      {editingRole.permissions?.slice(0, 10).map((permission: any) => (
                        <span key={permission.code || permission} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {permission.name || permission}
                        </span>
                      ))}
                      {editingRole.permissions && editingRole.permissions.length > 10 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{editingRole.permissions.length - 10} 更多
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                {permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">权限数据暂时无法加载</p>
                    <p className="text-xs text-gray-400">请稍后重试或联系管理员</p>
                  </div>
                ) : (
                  Object.entries(sortedGroupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {module}
                        <span className="ml-2 text-xs text-gray-500">({modulePermissions.length}个权限)</span>
                      </h4>
                      <div className="space-y-2 ml-4">
                        {modulePermissions.map((permission) => (
                          <label key={permission.code} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                              <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                              <p className="text-xs text-blue-600 font-mono">{permission.code}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    {editingRole?.is_system ? '关闭' : '取消'}
                  </Button>
                  {!editingRole?.is_system && (
                    <Button
                      onClick={handleSaveRole}
                      disabled={isLoading}
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}

export default RoleManagement;