-- 检查权限配置
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name IN ('users', 'user_roles', 'roles', 'permissions', 'role_permissions') 
ORDER BY table_name, grantee;

-- 如果没有权限，则授予权限
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;

-- 为anon角色授予基本权限（如果需要）
GRANT SELECT ON permissions TO anon;
GRANT SELECT ON roles TO anon;