-- 创建permission.config权限并为admin用户添加该权限
-- 创建时间：2025年8月28日
-- 创建人：Erikwang
-- 描述：确保permission.config权限存在并为admin用户添加该权限

-- 1. 检查permission.config权限是否存在，如果不存在则创建
DO $$
BEGIN
    -- 检查permission.config权限是否存在
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'permission.config') THEN
        -- 创建permission.config权限
        INSERT INTO permissions (code, name, module, page_name, route_path, description, sort_order, is_active)
        VALUES (
            'permission.config',
            '权限配置管理',
            'system',
            '权限管理',
            '/system/permissions',
            '管理系统权限配置，包括查看、编辑权限设置',
            10,
            true
        );
        RAISE NOTICE 'permission.config权限已创建';
    ELSE
        RAISE NOTICE 'permission.config权限已存在';
    END IF;
END $$;

-- 2. 为admin用户的角色添加permission.config权限
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

-- 3. 验证修复结果
SELECT '修复后Admin用户权限验证:' as info;
SELECT p.code, p.name, p.module
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'admin' AND p.code = 'permission.config';