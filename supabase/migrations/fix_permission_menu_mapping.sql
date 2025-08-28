-- 修复权限与菜单映射关系
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 清理冗余权限，确保权限树与侧导航子菜单完全一一对应

-- =============================================================================
-- 1. 清理冗余权限（软删除，设置为非活跃状态）
-- =============================================================================

-- 清理环境管理模块的冗余权限（只保留environment.monitoring）
UPDATE permissions 
SET is_active = FALSE, updated_at = NOW()
WHERE code IN (
    'environment.sensor',
    'environment.alert'
) AND is_active = TRUE;

-- 清理用户权限管理模块的冗余权限（只保留user.list和role.list）
UPDATE permissions 
SET is_active = FALSE, updated_at = NOW()
WHERE code IN (
    'permission.config'
) AND is_active = TRUE;

-- 清理系统设置模块的冗余权限（只保留settings.basic）
UPDATE permissions 
SET is_active = FALSE, updated_at = NOW()
WHERE code IN (
    'settings.notification',
    'settings.log',
    'settings.import_export'
) AND is_active = TRUE;

-- 清理送检管理模块的冗余权限（只保留submission.list和submission.create）
UPDATE permissions 
SET is_active = FALSE, updated_at = NOW()
WHERE code IN (
    'submission.detail',
    'submission.progress'
) AND is_active = TRUE;

-- =============================================================================
-- 2. 添加缺失的权限
-- =============================================================================

-- 添加特检异常中心权限（如果不存在）
INSERT INTO permissions (id, code, name, module, page_name, route_path, description, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'special.exception',
    '特检异常中心',
    '特检实验管理',
    '特检异常中心',
    '/special-experiment/exception-center',
    '处理特检异常',
    54,
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE code = 'special.exception'
);

-- =============================================================================
-- 3. 修正路径不匹配问题
-- =============================================================================

-- 修正普检实验管理模块的路径
UPDATE permissions 
SET route_path = '/general-experiment/list', updated_at = NOW()
WHERE code = 'routine.list' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/general-experiment/data-entry', updated_at = NOW()
WHERE code = 'routine.data_entry' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/general-experiment/data-review', updated_at = NOW()
WHERE code = 'routine.data_review' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/general-experiment/exception-handle', updated_at = NOW()
WHERE code = 'routine.exception' AND is_active = TRUE;

-- 修正质谱实验管理模块的路径
UPDATE permissions 
SET route_path = '/mass-spec/list', updated_at = NOW()
WHERE code = 'mass_spec.list' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/mass-spec/data-entry', updated_at = NOW()
WHERE code = 'mass_spec.data_entry' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/mass-spec/data-review', updated_at = NOW()
WHERE code = 'mass_spec.data_review' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/mass-spec/quality-control', updated_at = NOW()
WHERE code = 'mass_spec.qc' AND is_active = TRUE;

-- 修正特检实验管理模块的路径
UPDATE permissions 
SET route_path = '/special-experiment/wet-lab', updated_at = NOW()
WHERE code = 'special.wet_lab' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/special-experiment/machine-operation', updated_at = NOW()
WHERE code = 'special.instrument' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/special-experiment/analysis-interpretation', updated_at = NOW()
WHERE code = 'special.analysis' AND is_active = TRUE;

-- 修正实验室管理模块的路径
UPDATE permissions 
SET route_path = '/lab/management', updated_at = NOW()
WHERE code = 'lab.equipment' AND route_path = '/lab/equipment' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/lab/supplies', updated_at = NOW()
WHERE code = 'lab.consumables' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/lab/booking', updated_at = NOW()
WHERE code = 'lab.reservation' AND is_active = TRUE;

-- 修正环境管理模块的路径
UPDATE permissions 
SET route_path = '/environment/monitor', updated_at = NOW()
WHERE code = 'environment.monitoring' AND is_active = TRUE;

-- 修正用户管理模块的路径
UPDATE permissions 
SET route_path = '/user/account', updated_at = NOW()
WHERE code = 'user.list' AND is_active = TRUE;

UPDATE permissions 
SET route_path = '/user/role', updated_at = NOW()
WHERE code = 'role.list' AND is_active = TRUE;

-- 修正系统设置模块的路径
UPDATE permissions 
SET route_path = '/settings/system', updated_at = NOW()
WHERE code = 'settings.basic' AND is_active = TRUE;

-- =============================================================================
-- 4. 清理角色权限关联中的无效权限
-- =============================================================================

-- 删除指向已禁用权限的角色权限关联
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions WHERE is_active = FALSE
);

-- =============================================================================
-- 5. 验证修复结果
-- =============================================================================

-- 查看当前活跃权限列表（按模块分组）
SELECT 
    module,
    COUNT(*) as permission_count,
    STRING_AGG(code, ', ' ORDER BY sort_order) as permissions
FROM permissions 
WHERE is_active = TRUE 
GROUP BY module 
ORDER BY MIN(sort_order);

-- 查看被禁用的权限
SELECT 
    module,
    code,
    name,
    '已禁用' as status
FROM permissions 
WHERE is_active = FALSE 
ORDER BY module, sort_order;

-- 统计各角色的权限数量
SELECT 
    r.display_name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = TRUE
WHERE r.is_system = TRUE
GROUP BY r.id, r.display_name
ORDER BY r.display_name;

COMMIT;

-- 输出修复完成信息
SELECT '权限与菜单映射关系修复完成！' as message;
SELECT '已清理冗余权限，确保权限树与侧导航子菜单完全对应' as details;