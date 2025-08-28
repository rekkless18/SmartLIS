-- 检查admin用户的user.edit权限
-- 创建时间：2025年8月20日
-- 创建人：Erikwang

-- 1. 检查admin用户信息
SELECT 'Admin用户信息:' as info;
SELECT id, username, real_name, status FROM users WHERE username = 'admin';

-- 2. 检查admin用户的角色
SELECT 'Admin用户角色:' as info;
SELECT r.name, r.display_name, r.description 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

-- 3. 检查user.edit权限是否存在
SELECT 'User.edit权限检查:' as info;
SELECT id, code, name, description FROM permissions WHERE code = 'user.edit';

-- 4. 检查admin用户是否有user.edit权限
SELECT 'Admin用户权限检查:' as info;
SELECT DISTINCT p.code, p.name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.code = 'user.edit';

-- 5. 如果没有user.edit权限，添加该权限
DO $$
BEGIN
    -- 检查user.edit权限是否存在，如果不存在则创建
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'user.edit') THEN
        INSERT INTO permissions (code, name, module, page_name, route_path, description, created_at, updated_at)
        VALUES ('user.edit', '编辑用户', '用户管理', '账号管理', '/user/account', '编辑用户信息和分配角色', NOW(), NOW());
        RAISE NOTICE '已创建user.edit权限';
    END IF;
    
    -- 检查admin角色是否有user.edit权限，如果没有则添加
    IF NOT EXISTS (
        SELECT 1 FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.username = 'admin' AND p.code = 'user.edit'
    ) THEN
        -- 获取admin角色ID和user.edit权限ID
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW()
        FROM roles r, permissions p
        WHERE r.name = 'admin' AND p.code = 'user.edit'
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp2 
            WHERE rp2.role_id = r.id AND rp2.permission_id = p.id
        );
        RAISE NOTICE '已为admin角色添加user.edit权限';
    ELSE
        RAISE NOTICE 'admin角色已有user.edit权限';
    END IF;
END $$;

-- 6. 验证修复结果
SELECT '修复后验证:' as info;
SELECT DISTINCT p.code, p.name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.code LIKE 'user.%'
ORDER BY p.code;