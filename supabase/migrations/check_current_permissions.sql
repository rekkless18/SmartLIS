-- 检查当前数据库中的权限数据
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 分析当前权限数据，识别功能级权限和页面级权限

-- 查看所有权限数据
SELECT 
    code,
    name,
    module,
    page_name,
    route_path,
    description,
    sort_order
FROM permissions 
WHERE is_active = true
ORDER BY module, sort_order, code;

-- 识别可能的功能级权限（包含edit、delete、create等操作词的权限）
SELECT 
    code,
    name,
    module,
    page_name,
    '功能级权限' as permission_type
FROM permissions 
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
ORDER BY module, code;

-- 识别页面级权限（通常以.list、.view结尾或对应路由页面）
SELECT 
    code,
    name,
    module,
    page_name,
    route_path,
    '页面级权限' as permission_type
FROM permissions 
WHERE is_active = true
  AND (
    code LIKE '%.list' OR 
    code LIKE '%.view' OR
    code LIKE 'dashboard.%' OR
    route_path IS NOT NULL
  )
  AND NOT (
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
ORDER BY module, code;

-- 统计各模块的权限数量
SELECT 
    module,
    COUNT(*) as total_permissions,
    COUNT(CASE WHEN (
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
    ) THEN 1 END) as function_level_permissions,
    COUNT(CASE WHEN (
        code LIKE '%.list' OR 
        code LIKE '%.view' OR
        code LIKE 'dashboard.%'
    ) AND NOT (
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
    ) THEN 1 END) as page_level_permissions
FROM permissions 
WHERE is_active = true
GROUP BY module
ORDER BY module;