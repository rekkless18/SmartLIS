-- 修复admin用户角色管理权限问题
-- 创建时间：2025年8月20日
-- 创建人：Erikwang

-- 1. 检查当前admin用户信息
SELECT 'Admin用户信息:' as info;
SELECT id, username, real_name, status FROM users WHERE username = 'admin';

-- 2. 检查admin用户当前的角色
SELECT 'Admin用户角色:' as info;
SELECT r.name, r.display_name, r.description 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

-- 3. 检查role.edit和role.delete权限是否存在
SELECT 'Role管理权限检查:' as info;
SELECT id, code, name, module, description 
FROM permissions 
WHERE code IN ('role.edit', 'role.delete')
ORDER BY code;

-- 4. 检查admin角色当前拥有的权限
SELECT 'Admin角色当前权限:' as info;
SELECT DISTINCT p.code, p.name, p.module
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin'
AND p.code LIKE 'role.%'
ORDER BY p.code;

-- 5. 如果role.edit和role.delete权限不存在，则创建它们
INSERT INTO permissions (code, name, module, page_name, route_path, description, sort_order, is_active)
SELECT 'role.edit', '编辑角色', '系统管理', '角色管理', '/user/role', '编辑和修改角色信息的权限', 102, true
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'role.edit');

INSERT INTO permissions (code, name, module, page_name, route_path, description, sort_order, is_active)
SELECT 'role.delete', '删除角色', '系统管理', '角色管理', '/user/role', '删除角色的权限', 103, true
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'role.delete');

-- 6. 获取admin用户的角色ID（假设是admin角色）
DO $$
DECLARE
    admin_role_id uuid;
    role_edit_permission_id uuid;
    role_delete_permission_id uuid;
BEGIN
    -- 获取admin角色ID
    SELECT r.id INTO admin_role_id
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.username = 'admin' AND r.name = 'admin'
    LIMIT 1;
    
    -- 获取权限ID
    SELECT id INTO role_edit_permission_id FROM permissions WHERE code = 'role.edit';
    SELECT id INTO role_delete_permission_id FROM permissions WHERE code = 'role.delete';
    
    -- 如果找到了admin角色，则添加权限
    IF admin_role_id IS NOT NULL THEN
        -- 添加role.edit权限
        INSERT INTO role_permissions (role_id, permission_id, created_by)
        SELECT admin_role_id, role_edit_permission_id, 
               (SELECT id FROM users WHERE username = 'admin')
        WHERE NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = admin_role_id AND permission_id = role_edit_permission_id
        );
        
        -- 添加role.delete权限
        INSERT INTO role_permissions (role_id, permission_id, created_by)
        SELECT admin_role_id, role_delete_permission_id, 
               (SELECT id FROM users WHERE username = 'admin')
        WHERE NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = admin_role_id AND permission_id = role_delete_permission_id
        );
        
        RAISE NOTICE 'Admin角色权限已更新';
    ELSE
        RAISE NOTICE '未找到admin角色，请检查用户角色配置';
    END IF;
END $$;

-- 7. 验证权限添加结果
SELECT 'Admin角色更新后的权限:' as info;
SELECT DISTINCT p.code, p.name, p.module
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin'
AND p.code LIKE 'role.%'
ORDER BY p.code;

-- 8. 检查是否成功添加了role.edit和role.delete权限
SELECT 'Role管理权限验证:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.username = 'admin' AND p.code = 'role.edit'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as has_role_edit,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.username = 'admin' AND p.code = 'role.delete'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as has_role_delete;