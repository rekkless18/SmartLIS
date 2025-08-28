-- 验证role.list权限修复结果
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 确认权限修复脚本执行后的状态

-- =============================================================================
-- 1. 验证role.list权限状态
-- =============================================================================

SELECT '=== role.list权限修复后状态 ===' as status;
SELECT 
    id,
    code,
    name,
    module,
    page_name,
    route_path,
    is_active,
    sort_order
FROM permissions 
WHERE code = 'role.list';

-- =============================================================================
-- 2. 验证admin用户是否有role.list权限
-- =============================================================================

SELECT '=== admin用户role.list权限验证 ===' as status;
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
        ) THEN '✓ admin用户拥有role.list权限' 
        ELSE '✗ admin用户缺少role.list权限' 
    END as permission_status;

-- =============================================================================
-- 3. 显示admin用户当前的用户权限管理相关权限
-- =============================================================================

SELECT '=== admin用户权限管理相关权限 ===' as status;
SELECT DISTINCT
    p.code,
    p.name,
    p.module,
    p.is_active,
    '✓' as status
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin'
AND (p.module = '用户权限管理' OR p.code LIKE 'user.%' OR p.code LIKE 'role.%')
AND p.is_active = TRUE
ORDER BY p.code;

-- =============================================================================
-- 4. 检查系统管理员角色的权限总数
-- =============================================================================

SELECT '=== 系统管理员角色权限统计 ===' as status;
SELECT 
    r.display_name as role_name,
    COUNT(rp.permission_id) as total_permissions,
    COUNT(CASE WHEN p.is_active = TRUE THEN 1 END) as active_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
GROUP BY r.id, r.display_name;

-- =============================================================================
-- 5. 最终验证结果
-- =============================================================================

SELECT '=== 修复结果总结 ===' as status;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM permissions WHERE code = 'role.list' AND is_active = TRUE
        ) AND EXISTS (
            SELECT 1 
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.username = 'admin' 
            AND p.code = 'role.list' 
            AND p.is_active = TRUE
        ) THEN '✓ 权限修复成功，API应该可以正常访问'
        ELSE '✗ 权限修复失败，需要进一步检查'
    END as final_result;