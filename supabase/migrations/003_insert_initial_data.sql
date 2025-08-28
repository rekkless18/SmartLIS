-- SmartLis 智能实验室管理系统初始数据脚本
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 初始化系统基础数据，包括角色、权限、样本类型、检测项目等

-- =============================================================================
-- 1. 初始化角色数据
-- =============================================================================

INSERT INTO roles (id, name, display_name, description, is_system) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', '系统管理员', '系统管理员，拥有所有权限', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'lab_manager', '实验室主管', '实验室主管，负责实验室整体管理', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'technician', '实验员', '实验员，负责具体实验操作', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'quality_controller', '质控员', '质控员，负责质量控制和审核', TRUE),
('550e8400-e29b-41d4-a716-446655440005', 'report_reviewer', '报告审核员', '报告审核员，负责报告审核', TRUE),
('550e8400-e29b-41d4-a716-446655440006', 'sample_manager', '样本管理员', '样本管理员，负责样本管理', TRUE),
('550e8400-e29b-41d4-a716-446655440007', 'equipment_manager', '设备管理员', '设备管理员，负责设备管理', TRUE),
('550e8400-e29b-41d4-a716-446655440008', 'client_service', '客服人员', '客服人员，负责客户服务', TRUE);

-- =============================================================================
-- 2. 初始化权限数据
-- =============================================================================

INSERT INTO permissions (id, code, name, module, page_name, route_path, description, sort_order) VALUES
-- 首页模块
('650e8400-e29b-41d4-a716-446655440001', 'dashboard.view', '首页查看', '首页', '数据看板', '/dashboard', '查看首页数据看板', 1),

-- 送检管理模块
('650e8400-e29b-41d4-a716-446655440002', 'submission.list', '送检列表', '送检管理', '送检列表', '/submission/list', '查看送检申请列表', 10),
('650e8400-e29b-41d4-a716-446655440003', 'submission.create', '创建送检', '送检管理', '送检申请', '/submission/create', '创建新的送检申请', 11),
('650e8400-e29b-41d4-a716-446655440004', 'submission.detail', '送检详情', '送检管理', '送检详情', '/submission/detail', '查看送检申请详情', 12),
('650e8400-e29b-41d4-a716-446655440005', 'submission.progress', '进度查询', '送检管理', '进度查询', '/submission/progress', '查询送检进度', 13),

-- 样本管理模块
('650e8400-e29b-41d4-a716-446655440006', 'sample.list', '样本列表', '样本管理', '样本列表', '/sample/list', '查看样本列表', 20),
('650e8400-e29b-41d4-a716-446655440007', 'sample.receive', '样本接收', '样本管理', '样本接收', '/sample/receive', '接收样本', 21),
('650e8400-e29b-41d4-a716-446655440008', 'sample.storage', '样本出入库', '样本管理', '样本出入库', '/sample/storage', '管理样本出入库', 22),
('650e8400-e29b-41d4-a716-446655440009', 'sample.destroy', '样本销毁', '样本管理', '样本销毁', '/sample/destroy', '销毁样本', 23),

-- 普检实验管理模块
('650e8400-e29b-41d4-a716-446655440010', 'routine.list', '普检实验列表', '普检实验管理', '普检实验列表', '/experiment/routine/list', '查看普检实验列表', 30),
('650e8400-e29b-41d4-a716-446655440011', 'routine.data_entry', '普检数据录入', '普检实验管理', '数据录入', '/experiment/routine/data-entry', '录入普检实验数据', 31),
('650e8400-e29b-41d4-a716-446655440012', 'routine.data_review', '普检数据审核', '普检实验管理', '数据审核', '/experiment/routine/data-review', '审核普检实验数据', 32),
('650e8400-e29b-41d4-a716-446655440013', 'routine.exception', '普检异常处理', '普检实验管理', '异常处理', '/experiment/routine/exception', '处理普检异常', 33),

-- 质谱实验管理模块
('650e8400-e29b-41d4-a716-446655440014', 'mass_spec.list', '质谱实验列表', '质谱实验管理', '质谱实验列表', '/experiment/mass-spec/list', '查看质谱实验列表', 40),
('650e8400-e29b-41d4-a716-446655440015', 'mass_spec.data_entry', '质谱数据录入', '质谱实验管理', '质谱数据录入', '/experiment/mass-spec/data-entry', '录入质谱实验数据', 41),
('650e8400-e29b-41d4-a716-446655440016', 'mass_spec.data_review', '质谱数据审核', '质谱实验管理', '质谱数据审核', '/experiment/mass-spec/data-review', '审核质谱实验数据', 42),
('650e8400-e29b-41d4-a716-446655440017', 'mass_spec.qc', '质谱质控管理', '质谱实验管理', '质控管理', '/experiment/mass-spec/qc', '管理质谱质控', 43),

-- 特检实验管理模块
('650e8400-e29b-41d4-a716-446655440018', 'special.list', '特检实验列表', '特检实验管理', '特检实验列表', '/experiment/special/list', '查看特检实验列表', 50),
('650e8400-e29b-41d4-a716-446655440019', 'special.wet_lab', '湿实验管理', '特检实验管理', '湿实验管理', '/experiment/special/wet-lab', '管理湿实验', 51),
('650e8400-e29b-41d4-a716-446655440020', 'special.instrument', '上机管理', '特检实验管理', '上机管理', '/experiment/special/instrument', '管理上机操作', 52),
('650e8400-e29b-41d4-a716-446655440021', 'special.analysis', '分析解读', '特检实验管理', '分析解读', '/experiment/special/analysis', '进行分析解读', 53),

-- 报告管理模块
('650e8400-e29b-41d4-a716-446655440022', 'report.list', '报告列表', '报告管理', '报告列表', '/report/list', '查看报告列表', 60),
('650e8400-e29b-41d4-a716-446655440023', 'report.edit', '报告编辑', '报告管理', '报告编辑', '/report/edit', '编辑报告', 61),
('650e8400-e29b-41d4-a716-446655440024', 'report.review', '报告审核', '报告管理', '报告审核', '/report/review', '审核报告', 62),
('650e8400-e29b-41d4-a716-446655440025', 'report.template', '报告模板管理', '报告管理', '模板管理', '/report/template', '管理报告模板', 63),

-- 实验室管理模块
('650e8400-e29b-41d4-a716-446655440026', 'lab.equipment', '设备管理', '实验室管理', '设备管理', '/lab/equipment', '管理实验室设备', 70),
('650e8400-e29b-41d4-a716-446655440027', 'lab.consumables', '耗材管理', '实验室管理', '耗材管理', '/lab/consumables', '管理实验室耗材', 71),
('650e8400-e29b-41d4-a716-446655440028', 'lab.reservation', '预约管理', '实验室管理', '预约管理', '/lab/reservation', '管理设备预约', 72),

-- 环境管理模块
('650e8400-e29b-41d4-a716-446655440029', 'environment.monitoring', '环境监控', '环境管理', '环境监控', '/environment/monitoring', '监控实验室环境', 80),
('650e8400-e29b-41d4-a716-446655440030', 'environment.sensor', '传感器管理', '环境管理', '传感器管理', '/environment/sensor', '管理环境传感器', 81),
('650e8400-e29b-41d4-a716-446655440031', 'environment.alert', '报警设置', '环境管理', '报警设置', '/environment/alert', '设置环境报警', 82),

-- 用户权限管理模块
('650e8400-e29b-41d4-a716-446655440032', 'user.list', '用户管理', '用户权限管理', '用户管理', '/user/list', '管理系统用户', 90),
('650e8400-e29b-41d4-a716-446655440033', 'role.list', '角色管理', '用户权限管理', '角色管理', '/user/role', '管理用户角色', 91),
('650e8400-e29b-41d4-a716-446655440034', 'permission.config', '权限配置', '用户权限管理', '权限配置', '/user/permission', '配置用户权限', 92),

-- 系统设置模块
('650e8400-e29b-41d4-a716-446655440035', 'settings.basic', '基础配置', '系统设置', '基础配置', '/settings/basic', '系统基础配置', 100),
('650e8400-e29b-41d4-a716-446655440036', 'settings.notification', '通知设置', '系统设置', '通知设置', '/settings/notification', '系统通知设置', 101),
('650e8400-e29b-41d4-a716-446655440037', 'settings.log', '系统日志', '系统设置', '系统日志', '/settings/log', '查看系统日志', 102),
('650e8400-e29b-41d4-a716-446655440038', 'settings.import_export', '数据导入导出', '系统设置', '数据导入导出', '/settings/import-export', '数据导入导出', 103);

-- =============================================================================
-- 3. 初始化角色权限关联
-- =============================================================================

-- 系统管理员拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440001', id FROM permissions;

-- 实验室主管权限（除系统设置外的大部分权限）
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440002', id FROM permissions 
WHERE module IN ('首页', '送检管理', '样本管理', '普检实验管理', '质谱实验管理', '特检实验管理', '报告管理', '实验室管理', '环境管理', '用户权限管理');

-- 实验员权限（实验相关权限）
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440003', id FROM permissions 
WHERE module IN ('首页', '样本管理', '普检实验管理', '质谱实验管理', '特检实验管理') 
AND code NOT LIKE '%.review';

-- 质控员权限（审核相关权限）
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440004', id FROM permissions 
WHERE module IN ('首页', '样本管理', '普检实验管理', '质谱实验管理', '特检实验管理') 
OR code LIKE '%.review';

-- 报告审核员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440005', id FROM permissions 
WHERE module IN ('首页', '报告管理');

-- 样本管理员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440006', id FROM permissions 
WHERE module IN ('首页', '送检管理', '样本管理');

-- 设备管理员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440007', id FROM permissions 
WHERE module IN ('首页', '实验室管理', '环境管理');

-- 客服人员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440008', id FROM permissions 
WHERE module IN ('首页', '送检管理') AND code IN ('dashboard.view', 'submission.list', 'submission.detail', 'submission.progress');

-- =============================================================================
-- 4. 初始化样本类型数据
-- =============================================================================

INSERT INTO sample_types (id, code, name, description, storage_requirements, default_destroy_days, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'BLOOD', '血液', '全血、血清、血浆等血液样本', '2-8°C冷藏保存', 30, 1),
('750e8400-e29b-41d4-a716-446655440002', 'URINE', '尿液', '尿液样本', '2-8°C冷藏保存', 7, 2),
('750e8400-e29b-41d4-a716-446655440003', 'TISSUE', '组织', '各种组织样本', '-80°C冷冻保存', 90, 3),
('750e8400-e29b-41d4-a716-446655440004', 'CELL', '细胞', '细胞培养样本', '液氮保存', 180, 4),
('750e8400-e29b-41d4-a716-446655440005', 'DNA', 'DNA', 'DNA提取物', '-20°C冷冻保存', 365, 5),
('750e8400-e29b-41d4-a716-446655440006', 'RNA', 'RNA', 'RNA提取物', '-80°C冷冻保存', 180, 6),
('750e8400-e29b-41d4-a716-446655440007', 'PROTEIN', '蛋白质', '蛋白质提取物', '-80°C冷冻保存', 90, 7),
('750e8400-e29b-41d4-a716-446655440008', 'OTHER', '其他', '其他类型样本', '根据具体要求', 30, 99);

-- =============================================================================
-- 5. 初始化检测项目数据
-- =============================================================================

INSERT INTO test_items (id, code, name, category, method, unit, reference_range_male, reference_range_female, reference_range_child, normal_min, normal_max, sort_order) VALUES
-- 血液生化检测项目
('850e8400-e29b-41d4-a716-446655440001', 'GLU', '血糖', '生化', 'routine', 'mmol/L', '3.9-6.1', '3.9-6.1', '3.3-5.6', 3.9, 6.1, 1),
('850e8400-e29b-41d4-a716-446655440002', 'TC', '总胆固醇', '生化', 'routine', 'mmol/L', '<5.2', '<5.2', '<4.4', 0, 5.2, 2),
('850e8400-e29b-41d4-a716-446655440003', 'TG', '甘油三酯', '生化', 'routine', 'mmol/L', '<1.7', '<1.7', '<1.1', 0, 1.7, 3),
('850e8400-e29b-41d4-a716-446655440004', 'ALT', '丙氨酸氨基转移酶', '生化', 'routine', 'U/L', '9-50', '7-40', '9-50', 9, 50, 4),
('850e8400-e29b-41d4-a716-446655440005', 'AST', '天门冬氨酸氨基转移酶', '生化', 'routine', 'U/L', '15-40', '13-35', '15-40', 15, 40, 5),

-- 血常规检测项目
('850e8400-e29b-41d4-a716-446655440006', 'WBC', '白细胞计数', '血常规', 'routine', '×10^9/L', '3.5-9.5', '3.5-9.5', '4.0-12.0', 3.5, 9.5, 10),
('850e8400-e29b-41d4-a716-446655440007', 'RBC', '红细胞计数', '血常规', 'routine', '×10^12/L', '4.3-5.8', '3.8-5.1', '4.0-5.5', 4.3, 5.8, 11),
('850e8400-e29b-41d4-a716-446655440008', 'HGB', '血红蛋白', '血常规', 'routine', 'g/L', '130-175', '115-150', '110-160', 130, 175, 12),
('850e8400-e29b-41d4-a716-446655440009', 'PLT', '血小板计数', '血常规', 'routine', '×10^9/L', '125-350', '125-350', '150-450', 125, 350, 13),

-- 质谱检测项目
('850e8400-e29b-41d4-a716-446655440010', 'VD3', '维生素D3', '维生素', 'mass_spec', 'ng/mL', '30-100', '30-100', '30-100', 30, 100, 20),
('850e8400-e29b-41d4-a716-446655440011', 'VB12', '维生素B12', '维生素', 'mass_spec', 'pg/mL', '200-900', '200-900', '200-900', 200, 900, 21),
('850e8400-e29b-41d4-a716-446655440012', 'FOLATE', '叶酸', '维生素', 'mass_spec', 'ng/mL', '3-17', '3-17', '3-17', 3, 17, 22),

-- 特检项目
('850e8400-e29b-41d4-a716-446655440013', 'GENE_SEQ', '基因测序', '分子诊断', 'special', '', '', '', '', NULL, NULL, 30),
('850e8400-e29b-41d4-a716-446655440014', 'PCR', 'PCR检测', '分子诊断', 'special', '', '阴性', '阴性', '阴性', NULL, NULL, 31),
('850e8400-e29b-41d4-a716-446655440015', 'FISH', 'FISH检测', '细胞遗传学', 'special', '', '', '', '', NULL, NULL, 32);

-- =============================================================================
-- 6. 初始化检测产品数据
-- =============================================================================

INSERT INTO test_products (id, code, name, category, description, price, turnaround_time, sort_order) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'BASIC_PANEL', '基础生化套餐', '生化检测', '包含血糖、血脂、肝功能等基础生化指标', 150.00, 24, 1),
('950e8400-e29b-41d4-a716-446655440002', 'CBC_PANEL', '血常规检测', '血液检测', '全血细胞计数及分类', 50.00, 4, 2),
('950e8400-e29b-41d4-a716-446655440003', 'VITAMIN_PANEL', '维生素检测套餐', '营养检测', '维生素D3、B12、叶酸检测', 300.00, 48, 3),
('950e8400-e29b-41d4-a716-446655440004', 'GENETIC_PANEL', '基因检测套餐', '分子诊断', '基因测序和PCR检测', 1500.00, 168, 4),
('950e8400-e29b-41d4-a716-446655440005', 'COMPREHENSIVE', '全面体检套餐', '综合检测', '包含生化、血常规、维生素等多项检测', 500.00, 72, 5);

-- =============================================================================
-- 7. 初始化产品项目关联
-- =============================================================================

-- 基础生化套餐包含的项目
INSERT INTO product_items (product_id, item_id, is_required, sort_order) VALUES
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', TRUE, 1), -- 血糖
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', TRUE, 2), -- 总胆固醇
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', TRUE, 3), -- 甘油三酯
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440004', TRUE, 4), -- ALT
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440005', TRUE, 5); -- AST

-- 血常规检测包含的项目
INSERT INTO product_items (product_id, item_id, is_required, sort_order) VALUES
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440006', TRUE, 1), -- WBC
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440007', TRUE, 2), -- RBC
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440008', TRUE, 3), -- HGB
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440009', TRUE, 4); -- PLT

-- 维生素检测套餐包含的项目
INSERT INTO product_items (product_id, item_id, is_required, sort_order) VALUES
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440010', TRUE, 1), -- VD3
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440011', TRUE, 2), -- VB12
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440012', TRUE, 3); -- FOLATE

-- 基因检测套餐包含的项目
INSERT INTO product_items (product_id, item_id, is_required, sort_order) VALUES
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440013', TRUE, 1), -- 基因测序
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440014', TRUE, 2), -- PCR
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440015', FALSE, 3); -- FISH

-- 全面体检套餐包含的项目（包含前面所有项目）
INSERT INTO product_items (product_id, item_id, is_required, sort_order)
SELECT '950e8400-e29b-41d4-a716-446655440005', id, TRUE, sort_order
FROM test_items WHERE id IN (
    '850e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440006',
    '850e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440009',
    '850e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440012'
);

-- =============================================================================
-- 8. 初始化送检单位数据
-- =============================================================================

INSERT INTO client_units (id, code, name, type, contact_person, contact_phone, contact_email, address) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'HOSPITAL_001', '市第一人民医院', '医院', '张医生', '13800138001', 'zhang@hospital1.com', '市中心区人民路123号'),
('a50e8400-e29b-41d4-a716-446655440002', 'CLINIC_001', '康复诊所', '诊所', '李医生', '13800138002', 'li@clinic1.com', '市东区健康街456号'),
('a50e8400-e29b-41d4-a716-446655440003', 'COMPANY_001', '科技有限公司', '企业', '王经理', '13800138003', 'wang@company1.com', '市高新区科技园789号'),
('a50e8400-e29b-41d4-a716-446655440004', 'INDIVIDUAL', '个人客户', '个人', '客服中心', '400-123-4567', 'service@smartlis.com', '在线服务');

-- =============================================================================
-- 9. 初始化系统配置数据
-- =============================================================================

INSERT INTO system_configs (config_key, config_value, config_type, category, description, is_system) VALUES
-- 系统基础配置
('system.name', 'SmartLis 智能实验室管理系统', 'string', 'system', '系统名称', TRUE),
('system.version', '1.0.0', 'string', 'system', '系统版本', TRUE),
('system.timezone', 'Asia/Shanghai', 'string', 'system', '系统时区', TRUE),
('system.language', 'zh-CN', 'string', 'system', '系统默认语言', TRUE),

-- 业务配置
('business.submission_no_prefix', 'SB', 'string', 'business', '送检编号前缀', FALSE),
('business.sample_no_prefix', 'SP', 'string', 'business', '样本编号前缀', FALSE),
('business.experiment_no_prefix', 'EX', 'string', 'business', '实验编号前缀', FALSE),
('business.report_no_prefix', 'RP', 'string', 'business', '报告编号前缀', FALSE),
('business.default_turnaround_time', '24', 'number', 'business', '默认周转时间（小时）', FALSE),
('business.sample_destroy_days', '30', 'number', 'business', '样本默认销毁天数', FALSE),

-- 通知配置
('notification.email_enabled', 'true', 'boolean', 'notification', '是否启用邮件通知', FALSE),
('notification.sms_enabled', 'false', 'boolean', 'notification', '是否启用短信通知', FALSE),
('notification.system_enabled', 'true', 'boolean', 'notification', '是否启用系统通知', FALSE),

-- 安全配置
('security.password_min_length', '8', 'number', 'security', '密码最小长度', TRUE),
('security.password_require_special', 'true', 'boolean', 'security', '密码是否需要特殊字符', TRUE),
('security.session_timeout', '3600', 'number', 'security', '会话超时时间（秒）', TRUE),
('security.max_login_attempts', '5', 'number', 'security', '最大登录尝试次数', TRUE),

-- 文件配置
('file.max_upload_size', '10485760', 'number', 'file', '最大上传文件大小（字节）', FALSE),
('file.allowed_extensions', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png"]', 'json', 'file', '允许上传的文件扩展名', FALSE);

-- =============================================================================
-- 10. 初始化默认管理员用户
-- =============================================================================

-- 创建默认管理员用户（密码：admin123，需要在实际使用时修改）
INSERT INTO users (id, username, email, password_hash, real_name, department, position, status) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@smartlis.com', '$2b$10$rOzJqQZ8QxQZ8QxQZ8QxQeJ8QxQZ8QxQZ8QxQZ8QxQZ8QxQZ8QxQZ', '系统管理员', 'IT部门', '系统管理员', 'active');

-- 为默认管理员分配系统管理员角色
INSERT INTO user_roles (user_id, role_id) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001');

-- =============================================================================
-- 11. 初始化报告模板数据
-- =============================================================================

INSERT INTO report_templates (id, name, category, template_content, template_format, is_default) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '标准检测报告模板', '标准报告', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>检测报告</title>
    <style>
        body { font-family: "Microsoft YaHei", Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .content { margin: 20px 0; }
        .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{system_name}}</h1>
        <h2>检测报告</h2>
    </div>
    <div class="content">
        <p><strong>报告编号：</strong>{{report_no}}</p>
        <p><strong>送检单位：</strong>{{client_name}}</p>
        <p><strong>患者姓名：</strong>{{patient_name}}</p>
        <p><strong>检测日期：</strong>{{test_date}}</p>
        
        <h3>检测结果</h3>
        <table>
            <thead>
                <tr>
                    <th>检测项目</th>
                    <th>结果</th>
                    <th>单位</th>
                    <th>参考范围</th>
                    <th>异常标识</th>
                </tr>
            </thead>
            <tbody>
                {{#test_results}}
                <tr>
                    <td>{{item_name}}</td>
                    <td>{{result_value}}</td>
                    <td>{{unit}}</td>
                    <td>{{reference_range}}</td>
                    <td>{{abnormal_flag}}</td>
                </tr>
                {{/test_results}}
            </tbody>
        </table>
        
        <h3>检测结论</h3>
        <p>{{conclusion}}</p>
        
        <h3>建议</h3>
        <p>{{recommendations}}</p>
    </div>
    <div class="footer">
        <p><strong>检测人员：</strong>{{technician_name}}</p>
        <p><strong>审核人员：</strong>{{reviewer_name}}</p>
        <p><strong>报告日期：</strong>{{report_date}}</p>
    </div>
</body>
</html>', 'html', TRUE);

-- =============================================================================
-- 12. 更新表统计信息
-- =============================================================================

-- 更新表统计信息以优化查询性能
ANALYZE;

-- 提示信息
SELECT 'SmartLis 数据库初始化完成！' AS message;
SELECT 'Default admin user: admin / admin123 (请及时修改密码)' AS notice;