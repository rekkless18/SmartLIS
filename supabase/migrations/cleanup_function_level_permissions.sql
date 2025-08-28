-- 清理功能级权限，统一为页面级权限
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 移除所有功能级权限，只保留页面级权限，确保权限系统统一

-- =============================================================================
-- 第一步：备份当前权限数据（可选，用于回滚）
-- =============================================================================

-- 创建权限备份表
CREATE TABLE IF NOT EXISTS permissions_backup AS 
SELECT * FROM permissions WHERE is_active = true;

-- 创建角色权限关联备份表
CREATE TABLE IF NOT EXISTS role_permissions_backup AS 
SELECT rp.* FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE p.is_active = true;

-- =============================================================================
-- 第二步：删除角色权限关联中的功能级权限
-- =============================================================================

-- 删除功能级权限的角色关联
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE is_active = true
    AND (
        code LIKE '%.edit' OR 
        code LIKE '%.delete' OR 
        code LIKE '%.create' OR 
        code LIKE '%.update' OR 
        code LIKE '%.approve' OR 
        code LIKE '%.review' OR 
        code LIKE '%.execute' OR 
        code LIKE '%.publish' OR 
        code LIKE '%.download' OR 
        code LIKE '%.transfer' OR 
        code LIKE '%.receive' OR 
        code LIKE '%.assign_role' OR 
        code LIKE '%.manage' OR 
        code LIKE '%.config' OR 
        code LIKE '%.backup' OR 
        code LIKE '%.restore' OR 
        code LIKE '%.monitor'
    )
    -- 保留一些必要的页面级权限，即使它们包含这些关键词
    AND code NOT IN (
        'permission.config',  -- 权限配置页面
        'settings.basic',     -- 基础配置页面
        'environment.monitoring', -- 环境监控页面
        'report.review',      -- 报告审核页面
        'routine.data_review', -- 数据审核页面
        'mass_spec.data_review', -- 质谱数据审核页面
        'report.edit',        -- 报告编辑页面（包含创建和编辑功能）
        'routine.data_entry', -- 数据录入页面
        'mass_spec.data_entry' -- 质谱数据录入页面
    )
);

-- =============================================================================
-- 第三步：删除功能级权限记录
-- =============================================================================

-- 将功能级权限标记为非活跃状态（软删除）
UPDATE permissions 
SET is_active = false, 
    updated_at = NOW()
WHERE is_active = true
AND (
    code LIKE '%.edit' OR 
    code LIKE '%.delete' OR 
    code LIKE '%.create' OR 
    code LIKE '%.update' OR 
    code LIKE '%.approve' OR 
    code LIKE '%.review' OR 
    code LIKE '%.execute' OR 
    code LIKE '%.publish' OR 
    code LIKE '%.download' OR 
    code LIKE '%.transfer' OR 
    code LIKE '%.receive' OR 
    code LIKE '%.assign_role' OR 
    code LIKE '%.manage' OR 
    code LIKE '%.config' OR 
    code LIKE '%.backup' OR 
    code LIKE '%.restore' OR 
    code LIKE '%.monitor'
)
-- 保留一些必要的页面级权限
AND code NOT IN (
    'permission.config',  -- 权限配置页面
    'settings.basic',     -- 基础配置页面
    'environment.monitoring', -- 环境监控页面
    'report.review',      -- 报告审核页面
    'routine.data_review', -- 数据审核页面
    'mass_spec.data_review', -- 质谱数据审核页面
    'report.edit',        -- 报告编辑页面
    'routine.data_entry', -- 数据录入页面
    'mass_spec.data_entry' -- 质谱数据录入页面
);

-- =============================================================================
-- 第四步：确保所有角色都有必要的页面级权限
-- =============================================================================

-- 为系统管理员角色添加所有页面级权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001' as role_id, -- admin角色ID
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440001' 
    AND rp.permission_id = p.id
);

-- 为实验室主管角色添加必要的页面级权限（除系统设置外）
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002' as role_id, -- lab_manager角色ID
    p.id as permission_id
FROM permissions p
WHERE p.is_active = true
AND p.module NOT IN ('系统设置')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440002' 
    AND rp.permission_id = p.id
);

-- =============================================================================
-- 第五步：验证清理结果
-- =============================================================================

-- 查看剩余的活跃权限
SELECT 
    '清理后剩余权限' as status,
    module,
    COUNT(*) as permission_count
FROM permissions 
WHERE is_active = true
GROUP BY module
ORDER BY module;

-- 查看被清理的功能级权限
SELECT 
    '被清理的功能级权限' as status,
    code,
    name,
    module
FROM permissions 
WHERE is_active = false
AND updated_at >= NOW() - INTERVAL '1 hour'
ORDER BY module, code;

-- 查看系统管理员角色的权限数量
SELECT 
    '系统管理员权限数量' as status,
    COUNT(*) as permission_count
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440001'
AND p.is_active = true;

-- =============================================================================
-- 回滚脚本（如果需要）
-- =============================================================================

/*
-- 如果需要回滚，可以执行以下脚本：

-- 恢复权限数据
UPDATE permissions SET is_active = true WHERE id IN (
    SELECT id FROM permissions_backup
);

-- 恢复角色权限关联
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by)
SELECT role_id, permission_id, created_at, created_by
FROM role_permissions_backup
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = role_permissions_backup.role_id
    AND rp.permission_id = role_permissions_backup.permission_id
);

-- 删除备份表
DROP TABLE IF EXISTS permissions_backup;
DROP TABLE IF EXISTS role_permissions_backup;
*/