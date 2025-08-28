-- 更新角色权限关联，确保角色权限配置正确
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 为各个角色分配正确的页面级权限

-- =============================================================================
-- 验证当前角色权限状态
-- =============================================================================

-- 查看各角色当前的权限数量
SELECT 
    r.display_name as role_name,
    r.name as role_code,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = true
WHERE r.is_system = true
GROUP BY r.id, r.display_name, r.name
ORDER BY r.name;

-- =============================================================================
-- 为各角色分配正确的页面级权限
-- =============================================================================

-- 1. 系统管理员 - 拥有所有页面级权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001' as role_id, -- admin
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440001' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 2. 实验室主管 - 除系统设置外的所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002' as role_id, -- lab_manager
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND p.module IN ('首页', '送检管理', '样本管理', '普检实验管理', '质谱实验管理', '特检实验管理', '报告管理', '实验室管理', '环境管理', '用户权限管理')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440002' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 3. 实验员 - 实验相关权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440003' as role_id, -- technician
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND (
    p.module IN ('首页', '样本管理', '普检实验管理', '质谱实验管理', '特检实验管理')
    OR p.code IN ('submission.list', 'submission.create', 'submission.detail')
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440003' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 4. 质控员 - 审核相关权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440004' as role_id, -- analyst
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND (
    p.code = 'dashboard.view'
    OR p.module IN ('样本管理', '普检实验管理', '质谱实验管理', '特检实验管理')
    OR p.code LIKE '%review%'
    OR p.code = 'submission.list'
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440004' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 5. 报告审核员 - 报告相关权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440005' as role_id, -- report_reviewer
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND (
    p.code = 'dashboard.view'
    OR p.module = '报告管理'
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440005' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 6. 样本管理员 - 样本和送检相关权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440006' as role_id, -- sample_manager
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND (
    p.code = 'dashboard.view'
    OR p.module IN ('送检管理', '样本管理')
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440006' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 7. 设备管理员 - 实验室和环境管理权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440007' as role_id, -- equipment_manager
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND (
    p.code = 'dashboard.view'
    OR p.module IN ('实验室管理', '环境管理')
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440007' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- 8. 客服人员 - 基础查看权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440008' as role_id, -- customer_service
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND p.code IN ('dashboard.view', 'submission.list', 'submission.detail', 'submission.progress')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440008' 
    AND rp.permission_id = p.id
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 验证更新结果
-- =============================================================================

-- 查看更新后各角色的权限数量
SELECT 
    '更新后角色权限统计' as status,
    r.display_name as role_name,
    r.name as role_code,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = true
WHERE r.is_system = true
GROUP BY r.id, r.display_name, r.name
ORDER BY r.name;

-- 查看系统管理员的具体权限
SELECT 
    '系统管理员权限详情' as status,
    p.module,
    p.code,
    p.name
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440001'
AND p.is_active = true
ORDER BY p.module, p.sort_order, p.code;

-- 检查是否还有功能级权限被分配
SELECT 
    '检查剩余功能级权限分配' as status,
    r.display_name as role_name,
    p.code,
    p.name,
    p.module
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.is_active = true
AND (
    p.code LIKE '%.edit' OR 
    p.code LIKE '%.delete' OR 
    p.code LIKE '%.create' OR 
    p.code LIKE '%.update' OR 
    p.code LIKE '%.approve' OR 
    p.code LIKE '%.execute' OR 
    p.code LIKE '%.publish' OR 
    p.code LIKE '%.download' OR 
    p.code LIKE '%.transfer' OR 
    p.code LIKE '%.receive' OR 
    p.code LIKE '%.assign_role' OR 
    p.code LIKE '%.manage' OR 
    p.code LIKE '%.backup' OR 
    p.code LIKE '%.restore' OR 
    p.code LIKE '%.monitor'
)
-- 排除应该保留的页面级权限
AND p.code NOT IN (
    'permission.config',
    'settings.basic',
    'environment.monitoring',
    'report.review',
    'routine.data_review',
    'mass_spec.data_review',
    'report.edit',
    'routine.data_entry',
    'mass_spec.data_entry'
)
ORDER BY r.name, p.module, p.code;