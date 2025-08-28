-- SmartLis 智能实验室管理系统索引创建脚本
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 创建所有必要的索引以优化数据库性能

-- =============================================================================
-- 1. 唯一索引
-- =============================================================================

-- 用户表唯一索引
CREATE UNIQUE INDEX uk_users_username ON users(username);
CREATE UNIQUE INDEX uk_users_email ON users(email);

-- 角色表唯一索引
CREATE UNIQUE INDEX uk_roles_name ON roles(name);

-- 权限表唯一索引
CREATE UNIQUE INDEX uk_permissions_code ON permissions(code);

-- 样本类型表唯一索引
CREATE UNIQUE INDEX uk_sample_types_code ON sample_types(code);

-- 检测项目表唯一索引
CREATE UNIQUE INDEX uk_test_items_code ON test_items(code);

-- 检测产品表唯一索引
CREATE UNIQUE INDEX uk_test_products_code ON test_products(code);

-- 送检单位表唯一索引
CREATE UNIQUE INDEX uk_client_units_code ON client_units(code);

-- 实验员表唯一索引
CREATE UNIQUE INDEX uk_technicians_employee_no ON technicians(employee_no);

-- 送检申请表唯一索引
CREATE UNIQUE INDEX uk_submissions_no ON submissions(submission_no);

-- 样本表唯一索引
CREATE UNIQUE INDEX uk_samples_no ON samples(sample_no);
CREATE UNIQUE INDEX uk_samples_barcode ON samples(barcode);

-- 实验表唯一索引
CREATE UNIQUE INDEX uk_experiments_no ON experiments(experiment_no);

-- 报告表唯一索引
CREATE UNIQUE INDEX uk_reports_no ON reports(report_no);

-- 设备表唯一索引
CREATE UNIQUE INDEX uk_equipment_no ON equipment(equipment_no);

-- 耗材表唯一索引
CREATE UNIQUE INDEX uk_consumables_item_no ON consumables(item_no);

-- 环境监控点表唯一索引
CREATE UNIQUE INDEX uk_monitoring_points_no ON monitoring_points(point_no);

-- 系统配置表唯一索引
CREATE UNIQUE INDEX uk_system_configs_key ON system_configs(config_key);

-- =============================================================================
-- 2. 外键索引
-- =============================================================================

-- 用户角色关联表索引
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- 角色权限关联表索引
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 实验员表索引
CREATE INDEX idx_technicians_user_id ON technicians(user_id);

-- 产品项目关联表索引
CREATE INDEX idx_product_items_product_id ON product_items(product_id);
CREATE INDEX idx_product_items_item_id ON product_items(item_id);

-- 送检相关索引
CREATE INDEX idx_submissions_client_unit_id ON submissions(client_unit_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_submissions_created_by ON submissions(created_by);

-- 送检产品表索引
CREATE INDEX idx_submission_products_submission_id ON submission_products(submission_id);
CREATE INDEX idx_submission_products_product_id ON submission_products(product_id);

-- 送检进度表索引
CREATE INDEX idx_submission_progress_submission_id ON submission_progress(submission_id);
CREATE INDEX idx_submission_progress_operator_id ON submission_progress(operator_id);

-- 样本相关索引
CREATE INDEX idx_samples_submission_id ON samples(submission_id);
CREATE INDEX idx_samples_sample_type_id ON samples(sample_type_id);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_quality_status ON samples(quality_status);
CREATE INDEX idx_samples_received_time ON samples(received_time);
CREATE INDEX idx_samples_created_by ON samples(created_by);

-- 样本操作记录表索引
CREATE INDEX idx_sample_operations_sample_id ON sample_operations(sample_id);
CREATE INDEX idx_sample_operations_operator_id ON sample_operations(operator_id);
CREATE INDEX idx_sample_operations_operation_time ON sample_operations(operation_time);

-- 实验相关索引
CREATE INDEX idx_experiments_sample_id ON experiments(sample_id);
CREATE INDEX idx_experiments_product_id ON experiments(product_id);
CREATE INDEX idx_experiments_technician_id ON experiments(technician_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_method ON experiments(method);
CREATE INDEX idx_experiments_started_at ON experiments(started_at);
CREATE INDEX idx_experiments_created_by ON experiments(created_by);

-- 实验数据表索引
CREATE INDEX idx_experiment_data_experiment_id ON experiment_data(experiment_id);
CREATE INDEX idx_experiment_data_item_id ON experiment_data(item_id);
CREATE INDEX idx_experiment_data_is_abnormal ON experiment_data(is_abnormal);
CREATE INDEX idx_experiment_data_measured_at ON experiment_data(measured_at);

-- 实验审核表索引
CREATE INDEX idx_experiment_audits_experiment_id ON experiment_audits(experiment_id);
CREATE INDEX idx_experiment_audits_auditor_id ON experiment_audits(auditor_id);
CREATE INDEX idx_experiment_audits_audit_result ON experiment_audits(audit_result);

-- 实验异常表索引
CREATE INDEX idx_experiment_exceptions_experiment_id ON experiment_exceptions(experiment_id);
CREATE INDEX idx_experiment_exceptions_status ON experiment_exceptions(status);
CREATE INDEX idx_experiment_exceptions_severity ON experiment_exceptions(severity);

-- 报告相关索引
CREATE INDEX idx_reports_submission_id ON reports(submission_id);
CREATE INDEX idx_reports_template_id ON reports(template_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- 报告审核表索引
CREATE INDEX idx_report_audits_report_id ON report_audits(report_id);
CREATE INDEX idx_report_audits_auditor_id ON report_audits(auditor_id);
CREATE INDEX idx_report_audits_audit_result ON report_audits(audit_result);

-- 报告交付记录表索引
CREATE INDEX idx_report_deliveries_report_id ON report_deliveries(report_id);
CREATE INDEX idx_report_deliveries_delivery_status ON report_deliveries(delivery_status);

-- 设备相关索引
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_location ON equipment(location);

-- 设备预约表索引
CREATE INDEX idx_equipment_reservations_equipment_id ON equipment_reservations(equipment_id);
CREATE INDEX idx_equipment_reservations_user_id ON equipment_reservations(user_id);
CREATE INDEX idx_equipment_reservations_experiment_id ON equipment_reservations(experiment_id);
CREATE INDEX idx_equipment_reservations_status ON equipment_reservations(status);
CREATE INDEX idx_equipment_reservations_start_time ON equipment_reservations(start_time);

-- 耗材相关索引
CREATE INDEX idx_consumables_category ON consumables(category);
CREATE INDEX idx_consumables_is_active ON consumables(is_active);

-- 耗材库存表索引
CREATE INDEX idx_consumable_inventory_consumable_id ON consumable_inventory(consumable_id);
CREATE INDEX idx_consumable_inventory_status ON consumable_inventory(status);
CREATE INDEX idx_consumable_inventory_expiry_date ON consumable_inventory(expiry_date);

-- 耗材使用记录表索引
CREATE INDEX idx_consumable_usage_inventory_id ON consumable_usage(inventory_id);
CREATE INDEX idx_consumable_usage_experiment_id ON consumable_usage(experiment_id);
CREATE INDEX idx_consumable_usage_user_id ON consumable_usage(user_id);
CREATE INDEX idx_consumable_usage_usage_date ON consumable_usage(usage_date);

-- 环境监控相关索引
CREATE INDEX idx_monitoring_points_location ON monitoring_points(location);
CREATE INDEX idx_monitoring_points_is_active ON monitoring_points(is_active);

-- 环境数据表索引
CREATE INDEX idx_environmental_data_point_id ON environmental_data(point_id);
CREATE INDEX idx_environmental_data_measured_at ON environmental_data(measured_at);
CREATE INDEX idx_environmental_data_is_abnormal ON environmental_data(is_abnormal);

-- 系统管理相关索引
CREATE INDEX idx_system_configs_category ON system_configs(category);
CREATE INDEX idx_system_configs_is_system ON system_configs(is_system);

-- 系统日志表索引
CREATE INDEX idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_log_type ON system_logs(log_type);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_module ON system_logs(module);

-- 通知表索引
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);

-- =============================================================================
-- 3. 复合索引
-- =============================================================================

-- 用户状态和创建时间复合索引
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- 样本状态和类型复合索引
CREATE INDEX idx_samples_status_type ON samples(status, sample_type_id);

-- 实验方法和状态复合索引
CREATE INDEX idx_experiments_method_status ON experiments(method, status);

-- 实验技术员和状态复合索引
CREATE INDEX idx_experiments_technician_status ON experiments(technician_id, status);

-- 环境数据时间和监控点复合索引
CREATE INDEX idx_environmental_data_point_time ON environmental_data(point_id, measured_at);

-- 系统日志类型和时间复合索引
CREATE INDEX idx_system_logs_type_time ON system_logs(log_type, created_at);

-- 送检状态和提交时间复合索引
CREATE INDEX idx_submissions_status_submitted ON submissions(status, submitted_at);

-- 报告状态和生成时间复合索引
CREATE INDEX idx_reports_status_generated ON reports(status, generated_at);

-- 设备状态和类别复合索引
CREATE INDEX idx_equipment_status_category ON equipment(status, category);

-- 耗材库存状态和到期日期复合索引
CREATE INDEX idx_consumable_inventory_status_expiry ON consumable_inventory(status, expiry_date);

-- =============================================================================
-- 4. 部分索引（条件索引）
-- =============================================================================

-- 活跃用户索引
CREATE INDEX idx_users_active ON users(id) WHERE status = 'active';

-- 活跃样本类型索引
CREATE INDEX idx_sample_types_active ON sample_types(id) WHERE is_active = TRUE;

-- 活跃检测项目索引
CREATE INDEX idx_test_items_active ON test_items(id) WHERE is_active = TRUE;

-- 活跃检测产品索引
CREATE INDEX idx_test_products_active ON test_products(id) WHERE is_active = TRUE;

-- 活跃送检单位索引
CREATE INDEX idx_client_units_active ON client_units(id) WHERE is_active = TRUE;

-- 活跃实验员索引
CREATE INDEX idx_technicians_active ON technicians(id) WHERE is_active = TRUE;

-- 进行中的送检索引
CREATE INDEX idx_submissions_in_progress ON submissions(id) WHERE status IN ('submitted', 'received', 'in_progress');

-- 异常样本索引
CREATE INDEX idx_samples_abnormal ON samples(id) WHERE status = 'abnormal' OR quality_status = 'unqualified';

-- 进行中的实验索引
CREATE INDEX idx_experiments_in_progress ON experiments(id) WHERE status IN ('pending', 'in_progress');

-- 异常实验数据索引
CREATE INDEX idx_experiment_data_abnormal ON experiment_data(id) WHERE is_abnormal = TRUE;

-- 待审核的报告索引
CREATE INDEX idx_reports_pending_review ON reports(id) WHERE status = 'pending_review';

-- 可用设备索引
CREATE INDEX idx_equipment_available ON equipment(id) WHERE status = 'available';

-- 低库存耗材索引
CREATE INDEX idx_consumables_low_stock ON consumables(id) WHERE current_stock <= min_stock_level;

-- 即将过期的耗材库存索引（移除动态日期条件）
-- CREATE INDEX idx_consumable_inventory_expiring ON consumable_inventory(id) WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days';
-- 注意：此索引包含非IMMUTABLE函数，已注释。可通过应用层查询或定期重建索引来实现。

-- 异常环境数据索引
CREATE INDEX idx_environmental_data_abnormal ON environmental_data(id) WHERE is_abnormal = TRUE;

-- 系统配置非系统项索引
CREATE INDEX idx_system_configs_user_defined ON system_configs(id) WHERE is_system = FALSE;

-- 错误日志索引
CREATE INDEX idx_system_logs_errors ON system_logs(id) WHERE log_level IN ('ERROR', 'WARN');

-- 待发送通知索引
CREATE INDEX idx_notifications_pending ON notifications(id) WHERE status = 'pending';

-- =============================================================================
-- 5. 全文搜索索引
-- =============================================================================

-- 用户全文搜索索引
CREATE INDEX idx_users_fulltext ON users USING gin(to_tsvector('english', coalesce(real_name, '') || ' ' || coalesce(username, '') || ' ' || coalesce(email, '')));

-- 送检单位全文搜索索引
CREATE INDEX idx_client_units_fulltext ON client_units USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(contact_person, '')));

-- 检测项目全文搜索索引
CREATE INDEX idx_test_items_fulltext ON test_items USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(code, '')));

-- 检测产品全文搜索索引
CREATE INDEX idx_test_products_fulltext ON test_products USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- 设备全文搜索索引
CREATE INDEX idx_equipment_fulltext ON equipment USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(model, '') || ' ' || coalesce(manufacturer, '')));

-- 耗材全文搜索索引
CREATE INDEX idx_consumables_fulltext ON consumables USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(specification, '')));

-- =============================================================================
-- 6. 性能优化提示
-- =============================================================================

-- 更新表统计信息
ANALYZE;

-- 提示：定期执行 VACUUM ANALYZE 以保持索引性能
-- 提示：监控慢查询日志以识别需要额外索引的查询
-- 提示：考虑使用分区表对于大数据量的日志表（如 system_logs, environmental_data）