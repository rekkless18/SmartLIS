-- 验证权限与菜单映射关系
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 验证修复后的权限配置是否与侧导航菜单完全对应

-- =============================================================================
-- 1. 查看当前活跃权限列表（按模块分组）
-- =============================================================================

SELECT 
    '=== 当前活跃权限列表（按模块分组） ===' as title;

SELECT 
    module as 模块名称,
    COUNT(*) as 权限数量,
    STRING_AGG(name || ' (' || code || ')', ', ' ORDER BY sort_order) as 权限列表
FROM permissions 
WHERE is_active = TRUE 
GROUP BY module 
ORDER BY MIN(sort_order);

-- =============================================================================
-- 2. 查看被禁用的权限
-- =============================================================================

SELECT 
    '=== 已禁用的权限列表 ===' as title;

SELECT 
    module as 模块名称,
    name as 权限名称,
    code as 权限编码,
    '已禁用' as 状态
FROM permissions 
WHERE is_active = FALSE 
ORDER BY module, sort_order;

-- =============================================================================
-- 3. 验证侧导航菜单对应关系
-- =============================================================================

SELECT 
    '=== 侧导航菜单对应关系验证 ===' as title;

-- 预期的菜单结构（基于Layout.tsx中的menuItems）
WITH expected_menus AS (
    SELECT '首页看板' as menu_name, 'dashboard.view' as expected_permission, 1 as menu_order
    UNION ALL
    SELECT '送检管理', 'submission.list,submission.create', 2
    UNION ALL
    SELECT '样本管理', 'sample.list,sample.receive,sample.storage,sample.destroy', 3
    UNION ALL
    SELECT '普检实验管理', 'routine.list,routine.data_entry,routine.data_review,routine.exception', 4
    UNION ALL
    SELECT '质谱实验管理', 'mass_spec.list,mass_spec.data_entry,mass_spec.data_review,mass_spec.qc', 5
    UNION ALL
    SELECT '特检实验管理', 'special.wet_lab,special.instrument,special.analysis,special.exception', 6
    UNION ALL
    SELECT '报告管理', 'report.list,report.edit,report.review,report.template', 7
    UNION ALL
    SELECT '实验室管理', 'lab.equipment,lab.consumables,lab.reservation', 8
    UNION ALL
    SELECT '环境管理', 'environment.monitoring', 9
    UNION ALL
    SELECT '用户管理', 'user.list,role.list', 10
    UNION ALL
    SELECT '系统设置', 'settings.basic', 11
),
actual_permissions AS (
    SELECT 
        module,
        STRING_AGG(code, ',' ORDER BY sort_order) as actual_permissions
    FROM permissions 
    WHERE is_active = TRUE 
    GROUP BY module
)
SELECT 
    em.menu_name as 菜单名称,
    em.expected_permission as 预期权限,
    COALESCE(ap.actual_permissions, '无') as 实际权限,
    CASE 
        WHEN em.expected_permission = ap.actual_permissions THEN '✓ 匹配'
        WHEN ap.actual_permissions IS NULL THEN '✗ 缺失模块'
        ELSE '✗ 不匹配'
    END as 验证结果
FROM expected_menus em
LEFT JOIN actual_permissions ap ON (
    (em.menu_name = '首页' AND ap.module = '首页') OR
    (em.menu_name = '送检管理' AND ap.module = '送检管理') OR
    (em.menu_name = '样本管理' AND ap.module = '样本管理') OR
    (em.menu_name = '普检实验管理' AND ap.module = '普检实验管理') OR
    (em.menu_name = '质谱实验管理' AND ap.module = '质谱实验管理') OR
    (em.menu_name = '特检实验管理' AND ap.module = '特检实验管理') OR
    (em.menu_name = '报告管理' AND ap.module = '报告管理') OR
    (em.menu_name = '实验室管理' AND ap.module = '实验室管理') OR
    (em.menu_name = '环境管理' AND ap.module = '环境管理') OR
    (em.menu_name = '用户管理' AND ap.module = '用户权限管理') OR
    (em.menu_name = '系统设置' AND ap.module = '系统设置')
)
ORDER BY em.menu_order;

-- =============================================================================
-- 4. 统计各角色的权限数量
-- =============================================================================

SELECT 
    '=== 各角色权限统计 ===' as title;

SELECT 
    r.display_name as 角色名称,
    COUNT(rp.permission_id) as 权限数量,
    STRING_AGG(p.name, ', ' ORDER BY p.sort_order) as 权限列表
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = TRUE
WHERE r.is_system = TRUE
GROUP BY r.id, r.display_name
ORDER BY r.display_name;

-- =============================================================================
-- 5. 检查路径匹配情况
-- =============================================================================

SELECT 
    '=== 路径匹配检查 ===' as title;

SELECT 
    code as 权限编码,
    name as 权限名称,
    route_path as 路由路径,
    CASE 
        WHEN route_path LIKE '/dashboard%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/submission%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/sample%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/general-experiment%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/mass-spec%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/special-experiment%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/report%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/lab%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/environment%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/user%' THEN '✓ 路径正确'
        WHEN route_path LIKE '/settings%' THEN '✓ 路径正确'
        ELSE '✗ 路径可能有问题'
    END as 路径检查结果
FROM permissions 
WHERE is_active = TRUE 
ORDER BY sort_order;

-- =============================================================================
-- 6. 总结报告
-- =============================================================================

SELECT 
    '=== 修复总结报告 ===' as title;

SELECT 
    '总权限数' as 统计项,
    COUNT(*) as 数量
FROM permissions
UNION ALL
SELECT 
    '活跃权限数',
    COUNT(*)
FROM permissions 
WHERE is_active = TRUE
UNION ALL
SELECT 
    '已禁用权限数',
    COUNT(*)
FROM permissions 
WHERE is_active = FALSE
UNION ALL
SELECT 
    '模块数量',
    COUNT(DISTINCT module)
FROM permissions 
WHERE is_active = TRUE;

SELECT '权限与菜单映射关系验证完成！' as message;