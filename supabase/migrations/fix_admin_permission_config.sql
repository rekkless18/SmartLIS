-- 修复admin用户缺失permission.config权限的问题
-- 创建时间：2025年8月28日
-- 创建人：Erikwang
-- 描述：为admin用户的角色添加permission.config权限，确保能够访问权限管理相关的API接口

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

-- 3. 检查permission.config权限是否存在
SELECT 'permission.config权限信息:' as info;
SELECT id, code, name, module, is_active FROM permissions WHERE code = 'permission.config';

-- 4. 检查admin用户是否已有permission.config权限
SELECT 'Admin用户当前权限检查:' as info;
SELECT p.code, p.name, p.module
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.code = 'permission.config';

-- 5. 为admin用户的角色添加permission.config权限
DO $$
DECLARE
    admin_role_id uuid;
    permission_config_id uuid;
    admin_user_id uuid;
BEGIN
    -- 获取admin用户ID
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';
    
    -- 获取admin用户的角色ID（假设admin用户只有一个角色）
    SELECT r.id INTO admin_role_id
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.username = 'admin'
    LIMIT 1;
    
    -- 获取permission.config权限ID
    SELECT id INTO permission_config_id FROM permissions WHERE code = 'permission.config' AND is_active = true;
    
    -- 检查是否找到了必要的ID
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin用户的角色未找到';
    END IF;
    
    IF permission_config_id IS NULL THEN
        RAISE EXCEPTION 'permission.config权限未找到或未激活';
    END IF;
    
    -- 检查admin角色是否已有permission.config权限
    IF NOT EXISTS (
        SELECT 1 FROM role_permissions 
        WHERE role_id = admin_role_id AND permission_id = permission_config_id
    ) THEN
        -- 添加permission.config权限到admin角色
        INSERT INTO role_permissions (role_id, permission_id, created_by, created_at)
        VALUES (admin_role_id, permission_config_id, admin_user_id, NOW());
        
        RAISE NOTICE 'Admin角色已添加permission.config权限';
    ELSE
        RAISE NOTICE 'Admin角色已经拥有permission.config权限';
    END IF;
END $$;

-- 6. 验证修复结果
SELECT '修复后Admin用户权限验证:' as info;
SELECT p.code, p.name, p.module
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.code = 'permission.config';

-- 7. 显示admin用户的所有权限（用于确认）
SELECT 'Admin用户所有权限列表:' as info;
SELECT p.code, p.name, p.module, p.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.is_active = true
ORDER BY p.module, p.sort_order, p.name;