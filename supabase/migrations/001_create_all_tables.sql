-- SmartLis 智能实验室管理系统数据库初始化脚本
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 创建所有核心业务表结构、索引和约束

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. 用户权限模块
-- =============================================================================

-- 1.1 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'locked')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.password_hash IS '密码哈希';
COMMENT ON COLUMN users.real_name IS '真实姓名';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.department IS '部门';
COMMENT ON COLUMN users.position IS '职位';
COMMENT ON COLUMN users.status IS '状态：active-活跃，inactive-非活跃，locked-锁定';

-- 1.2 角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE roles IS '角色表';
COMMENT ON COLUMN roles.name IS '角色名称（英文）';
COMMENT ON COLUMN roles.display_name IS '角色显示名称（中文）';
COMMENT ON COLUMN roles.is_system IS '是否系统角色';

-- 1.3 权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    route_path VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE permissions IS '权限表';
COMMENT ON COLUMN permissions.code IS '权限编码';
COMMENT ON COLUMN permissions.name IS '权限名称';
COMMENT ON COLUMN permissions.module IS '所属模块';
COMMENT ON COLUMN permissions.page_name IS '页面名称';
COMMENT ON COLUMN permissions.route_path IS '路由路径';

-- 1.4 用户角色关联表
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS '用户角色关联表';

-- 1.5 角色权限关联表
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS '角色权限关联表';

-- =============================================================================
-- 2. 系统设置模块
-- =============================================================================

-- 2.1 样本类型表
CREATE TABLE sample_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    storage_requirements TEXT,
    default_destroy_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE sample_types IS '样本类型表';
COMMENT ON COLUMN sample_types.code IS '样本类型编码';
COMMENT ON COLUMN sample_types.name IS '样本类型名称';
COMMENT ON COLUMN sample_types.storage_requirements IS '存储要求';
COMMENT ON COLUMN sample_types.default_destroy_days IS '默认销毁天数';

-- 2.2 检测项目表
CREATE TABLE test_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('routine', 'mass_spec', 'special')),
    unit VARCHAR(20),
    reference_range_male VARCHAR(100),
    reference_range_female VARCHAR(100),
    reference_range_child VARCHAR(100),
    normal_min DECIMAL(10,4),
    normal_max DECIMAL(10,4),
    critical_min DECIMAL(10,4),
    critical_max DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE test_items IS '检测项目表';
COMMENT ON COLUMN test_items.method IS '检测方法：routine-普检，mass_spec-质谱，special-特检';
COMMENT ON COLUMN test_items.reference_range_male IS '男性参考范围';
COMMENT ON COLUMN test_items.reference_range_female IS '女性参考范围';
COMMENT ON COLUMN test_items.reference_range_child IS '儿童参考范围';

-- 2.3 检测产品表
CREATE TABLE test_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    turnaround_time INTEGER NOT NULL DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE test_products IS '检测产品表';
COMMENT ON COLUMN test_products.turnaround_time IS '周转时间（小时）';

-- 2.4 产品项目关联表
CREATE TABLE product_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES test_products(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES test_items(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(product_id, item_id)
);

COMMENT ON TABLE product_items IS '产品项目关联表';

-- 2.5 送检单位表
CREATE TABLE client_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address TEXT,
    contract_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE client_units IS '送检单位表';
COMMENT ON COLUMN client_units.type IS '单位类型';
COMMENT ON COLUMN client_units.contract_info IS '合同信息（JSON格式）';

-- 2.6 实验员表
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_no VARCHAR(50) UNIQUE NOT NULL,
    methods JSONB NOT NULL DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE technicians IS '实验员表';
COMMENT ON COLUMN technicians.methods IS '绑定的方法学（JSON数组）';
COMMENT ON COLUMN technicians.certifications IS '资质认证（JSON数组）';
COMMENT ON COLUMN technicians.skills IS '技能列表（JSON数组）';

-- =============================================================================
-- 3. 送检管理模块
-- =============================================================================

-- 3.1 送检申请表
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_no VARCHAR(50) UNIQUE NOT NULL,
    client_unit_id UUID NOT NULL REFERENCES client_units(id),
    patient_name VARCHAR(100) NOT NULL,
    patient_gender VARCHAR(10) CHECK (patient_gender IN ('male', 'female', 'unknown')),
    patient_age INTEGER,
    patient_id_card VARCHAR(50),
    contact_phone VARCHAR(20),
    is_urgent BOOLEAN DEFAULT FALSE,
    clinical_info TEXT,
    sample_info TEXT,
    attachment_urls JSONB DEFAULT '[]',
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'received', 'in_progress', 'completed', 'cancelled', 'abnormal')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    received_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE submissions IS '送检申请表';
COMMENT ON COLUMN submissions.submission_no IS '送检编号';
COMMENT ON COLUMN submissions.patient_gender IS '患者性别：male-男，female-女，unknown-未知';
COMMENT ON COLUMN submissions.is_urgent IS '是否加急';
COMMENT ON COLUMN submissions.status IS '状态：submitted-已提交，received-已接收，in_progress-进行中，completed-已完成，cancelled-已取消，abnormal-异常';

-- 3.2 送检产品表
CREATE TABLE submission_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES test_products(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

COMMENT ON TABLE submission_products IS '送检产品表';

-- 3.3 送检进度表
CREATE TABLE submission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    operator_id UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE submission_progress IS '送检进度表';
COMMENT ON COLUMN submission_progress.stage IS '阶段名称';
COMMENT ON COLUMN submission_progress.status IS '阶段状态';

-- =============================================================================
-- 4. 样本管理模块
-- =============================================================================

-- 4.1 样本表
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_no VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    submission_id UUID NOT NULL REFERENCES submissions(id),
    sample_type_id UUID NOT NULL REFERENCES sample_types(id),
    volume DECIMAL(8,2),
    unit VARCHAR(20) DEFAULT 'ml',
    collection_time TIMESTAMP WITH TIME ZONE,
    received_time TIMESTAMP WITH TIME ZONE,
    storage_location VARCHAR(100),
    storage_temperature VARCHAR(20),
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'in_storage', 'out_for_test', 'testing', 'completed', 'destroyed', 'abnormal')),
    quality_status VARCHAR(20) DEFAULT 'qualified' CHECK (quality_status IN ('qualified', 'unqualified', 'pending')),
    abnormal_reason TEXT,
    destroy_reason TEXT,
    destroy_date DATE,
    expected_destroy_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE samples IS '样本表';
COMMENT ON COLUMN samples.sample_no IS '样本编号';
COMMENT ON COLUMN samples.barcode IS '条形码';
COMMENT ON COLUMN samples.status IS '状态：received-已接收，in_storage-在库，out_for_test-出库待检，testing-检测中，completed-已完成，destroyed-已销毁，abnormal-异常';
COMMENT ON COLUMN samples.quality_status IS '质量状态：qualified-合格，unqualified-不合格，pending-待审核';

-- 4.2 样本操作记录表
CREATE TABLE sample_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL,
    operation_desc TEXT,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    volume_before DECIMAL(8,2),
    volume_after DECIMAL(8,2),
    operator_id UUID REFERENCES users(id),
    operation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT
);

COMMENT ON TABLE sample_operations IS '样本操作记录表';
COMMENT ON COLUMN sample_operations.operation_type IS '操作类型：receive-接收，outbound-出库，inbound-入库，destroy-销毁';

-- =============================================================================
-- 5. 实验管理模块
-- =============================================================================

-- 5.1 实验表
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_no VARCHAR(50) UNIQUE NOT NULL,
    sample_id UUID NOT NULL REFERENCES samples(id),
    product_id UUID NOT NULL REFERENCES test_products(id),
    method VARCHAR(50) NOT NULL CHECK (method IN ('routine', 'mass_spec', 'special')),
    technician_id UUID REFERENCES technicians(id),
    equipment_id UUID,
    batch_no VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE experiments IS '实验表';
COMMENT ON COLUMN experiments.method IS '实验方法：routine-普检，mass_spec-质谱，special-特检';
COMMENT ON COLUMN experiments.status IS '状态：pending-待开始，in_progress-进行中，completed-已完成，failed-失败，cancelled-已取消';

-- 5.2 实验数据表
CREATE TABLE experiment_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES test_items(id),
    result_value VARCHAR(200),
    result_numeric DECIMAL(15,6),
    result_text TEXT,
    unit VARCHAR(20),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormal_flag VARCHAR(10),
    quality_control JSONB,
    instrument_data JSONB,
    measured_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE experiment_data IS '实验数据表';
COMMENT ON COLUMN experiment_data.result_value IS '结果值（字符串）';
COMMENT ON COLUMN experiment_data.result_numeric IS '结果值（数值）';
COMMENT ON COLUMN experiment_data.abnormal_flag IS '异常标识：H-偏高，L-偏低，HH-严重偏高，LL-严重偏低';

-- 5.3 实验审核表
CREATE TABLE experiment_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES users(id),
    audit_level INTEGER NOT NULL DEFAULT 1,
    audit_result VARCHAR(20) NOT NULL CHECK (audit_result IN ('approved', 'rejected', 'pending')),
    audit_comments TEXT,
    audit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE experiment_audits IS '实验审核表';
COMMENT ON COLUMN experiment_audits.audit_level IS '审核级别';
COMMENT ON COLUMN experiment_audits.audit_result IS '审核结果：approved-通过，rejected-拒绝，pending-待审核';

-- 5.4 实验异常表
CREATE TABLE experiment_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    exception_type VARCHAR(50) NOT NULL,
    exception_desc TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution TEXT,
    resolver_id UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE experiment_exceptions IS '实验异常表';
COMMENT ON COLUMN experiment_exceptions.exception_type IS '异常类型';
COMMENT ON COLUMN experiment_exceptions.severity IS '严重程度：low-低，medium-中，high-高，critical-严重';

-- =============================================================================
-- 6. 报告管理模块
-- =============================================================================

-- 6.1 报告模板表
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    template_format VARCHAR(20) DEFAULT 'html',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE report_templates IS '报告模板表';
COMMENT ON COLUMN report_templates.template_format IS '模板格式：html, docx, pdf';

-- 6.2 报告表
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_no VARCHAR(50) UNIQUE NOT NULL,
    submission_id UUID NOT NULL REFERENCES submissions(id),
    template_id UUID REFERENCES report_templates(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    summary TEXT,
    conclusion TEXT,
    recommendations TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'delivered', 'cancelled')),
    generated_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    file_urls JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE reports IS '报告表';
COMMENT ON COLUMN reports.status IS '状态：draft-草稿，pending_review-待审核，approved-已审核，delivered-已交付，cancelled-已取消';
COMMENT ON COLUMN reports.file_urls IS '报告文件URL列表（JSON数组）';

-- 6.3 报告审核表
CREATE TABLE report_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES users(id),
    audit_level INTEGER NOT NULL DEFAULT 1,
    audit_result VARCHAR(20) NOT NULL CHECK (audit_result IN ('approved', 'rejected', 'pending')),
    audit_comments TEXT,
    audit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE report_audits IS '报告审核表';

-- 6.4 报告交付记录表
CREATE TABLE report_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    delivery_method VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100),
    recipient_contact VARCHAR(100),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'cancelled')),
    delivery_time TIMESTAMP WITH TIME ZONE,
    tracking_info JSONB,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE report_deliveries IS '报告交付记录表';
COMMENT ON COLUMN report_deliveries.delivery_method IS '交付方式：email, download, print, courier';

-- =============================================================================
-- 7. 实验室管理模块
-- =============================================================================

-- 7.1 设备表
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    purchase_date DATE,
    warranty_end_date DATE,
    supplier VARCHAR(100),
    purchase_price DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'fault', 'retired')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    last_calibration_date DATE,
    next_calibration_date DATE,
    specifications JSONB,
    maintenance_records JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE equipment IS '设备表';
COMMENT ON COLUMN equipment.status IS '状态：available-可用，in_use-使用中，maintenance-维护中，fault-故障，retired-报废';

-- 7.2 设备预约表
CREATE TABLE equipment_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    user_id UUID NOT NULL REFERENCES users(id),
    experiment_id UUID REFERENCES experiments(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'reserved' CHECK (status IN ('reserved', 'in_use', 'completed', 'cancelled')),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    usage_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE equipment_reservations IS '设备预约表';

-- 7.3 耗材表
CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    specification VARCHAR(100),
    unit VARCHAR(20) NOT NULL,
    supplier VARCHAR(100),
    manufacturer VARCHAR(100),
    storage_conditions TEXT,
    safety_level VARCHAR(20),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    current_stock INTEGER DEFAULT 0,
    unit_price DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE consumables IS '耗材表';
COMMENT ON COLUMN consumables.safety_level IS '安全等级';

-- 7.4 耗材库存表
CREATE TABLE consumable_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumable_id UUID NOT NULL REFERENCES consumables(id),
    batch_no VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,4),
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_DATE,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'expired', 'consumed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE consumable_inventory IS '耗材库存表';

-- 7.5 耗材使用记录表
CREATE TABLE consumable_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES consumable_inventory(id),
    experiment_id UUID REFERENCES experiments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    quantity_used INTEGER NOT NULL,
    usage_date DATE DEFAULT CURRENT_DATE,
    purpose TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

COMMENT ON TABLE consumable_usage IS '耗材使用记录表';

-- =============================================================================
-- 8. 环境管理模块
-- =============================================================================

-- 8.1 环境监控点表
CREATE TABLE monitoring_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    sensor_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL,
    thresholds JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE monitoring_points IS '环境监控点表';
COMMENT ON COLUMN monitoring_points.parameters IS '监控参数配置（JSON）';
COMMENT ON COLUMN monitoring_points.thresholds IS '阈值配置（JSON）';

-- 8.2 环境数据表
CREATE TABLE environmental_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_id UUID NOT NULL REFERENCES monitoring_points(id),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    pressure DECIMAL(8,2),
    air_quality DECIMAL(8,2),
    gas_concentration JSONB,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormal_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE environmental_data IS '环境数据表';
COMMENT ON COLUMN environmental_data.gas_concentration IS '气体浓度数据（JSON）';
COMMENT ON COLUMN environmental_data.abnormal_params IS '异常参数（JSON）';

-- =============================================================================
-- 9. 系统管理模块
-- =============================================================================

-- 9.1 系统配置表
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE system_configs IS '系统配置表';
COMMENT ON COLUMN system_configs.config_type IS '配置类型：string, number, boolean, json';

-- 9.2 系统日志表
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level VARCHAR(20) NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    module VARCHAR(50),
    action VARCHAR(100),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    request_params JSONB,
    response_status INTEGER,
    execution_time INTEGER,
    error_message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE system_logs IS '系统日志表';
COMMENT ON COLUMN system_logs.log_level IS '日志级别：DEBUG, INFO, WARN, ERROR';
COMMENT ON COLUMN system_logs.log_type IS '日志类型：operation, security, error, performance';

-- 9.3 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_users JSONB,
    target_roles JSONB,
    channels JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE notifications IS '通知表';
COMMENT ON COLUMN notifications.channels IS '通知渠道：email, sms, system';
COMMENT ON COLUMN notifications.delivery_status IS '各渠道发送状态（JSON）';