-- 检查role.list权限状态和admin用户权限分配
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 诊断角色详情API 403错误问题

-- =============================================================================
-- 1. 检查role.list权限是否存在且活跃
-- =============================================================================

SELECT 'role.list权限状态检查:' as info;
SELECT 
    id,
    code,
    name,
    module,
    page_name,
    route_path,
    is_active,
    created_at,
    updated_at
FROM permissions 
WHERE code = 'role.list';

-- =============================================================================
-- 2. 检查admin用户信息
-- =============================================================================

SELECT 'admin用户信息:' as info;
SELECT 
    id,
    username,
    real_name,
    status
FROM users 
WHERE username = 'admin';

-- =============================================================================
-- 3. 检查admin用户的角色分配
-- =============================================================================

SELECT 'admin用户角色分配:' as info;
SELECT 
    r.id as role_id,
    r.name as role_code,
    r.display_name,
    r.description
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

-- =============================================================================
-- 4. 检查admin用户是否有role.list权限
-- =============================================================================

SELECT 'admin用户role.list权限检查:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.username = 'admin' 
            AND p.code = 'role.list' 
            AND p.is_active = TRUE
        ) THEN 'YES' 
        ELSE 'NO' 
    END as has_role_list_permission;

-- =============================================================================
-- 5. 检查admin用户的所有权限
-- =============================================================================

SELECT 'admin用户所有权限:' as info;
SELECT DISTINCT
    p.code,
    p.name,
    p.module,
    p.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin'
ORDER BY p.module, p.code;

-- =============================================================================
-- 6. 检查所有用户权限管理相关的权限状态
-- =============================================================================

SELECT '用户权限管理模块权限状态:' as info;
SELECT 
    code,
    name,
    module,
    is_active,
    route_path
FROM permissions 
WHERE module = '用户权限管理' OR code LIKE 'user.%' OR code LIKE 'role.%'
ORDER BY code;