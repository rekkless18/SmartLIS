-- 为roles表添加status字段
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 为角色表添加状态字段，用于控制角色的启用/禁用状态

-- 添加status字段到roles表
ALTER TABLE roles ADD COLUMN status BOOLEAN DEFAULT TRUE;

-- 为现有角色设置默认状态为启用
UPDATE roles SET status = TRUE WHERE status IS NULL;

-- 添加字段注释
COMMENT ON COLUMN roles.status IS '角色状态：TRUE-启用，FALSE-禁用';

-- 创建索引以提高查询性能
CREATE INDEX idx_roles_status ON roles(status);