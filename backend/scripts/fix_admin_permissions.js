/**
 * 修复admin用户权限脚本
 * 创建时间：2025年8月28日
 * 创建人：Erikwang
 * 描述：创建permission.config权限并为admin用户分配该权限
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置信息');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPermissions() {
  try {
    console.log('开始修复admin用户权限...');
    
    // 1. 检查permission.config权限是否存在
    console.log('1. 检查permission.config权限是否存在...');
    let { data: permissionData, error: permissionError } = await supabase
      .from('permissions')
      .select('*')
      .eq('code', 'permission.config')
      .single();
    
    if (permissionError && permissionError.code !== 'PGRST116') {
      throw new Error(`查询权限失败: ${permissionError.message}`);
    }
    
    // 2. 如果权限不存在，创建它
    if (!permissionData) {
      console.log('2. 创建permission.config权限...');
      const { data: newPermission, error: createError } = await supabase
        .from('permissions')
        .insert({
          code: 'permission.config',
          name: '权限配置管理',
          module: 'system',
          page_name: '权限管理',
          route_path: '/system/permissions',
          description: '管理系统权限配置，包括查看、编辑权限设置',
          sort_order: 10,
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        throw new Error(`创建权限失败: ${createError.message}`);
      }
      
      permissionData = newPermission;
      console.log('✓ permission.config权限创建成功');
    } else {
      console.log('✓ permission.config权限已存在');
    }
    
    // 3. 获取admin用户信息
    console.log('3. 获取admin用户信息...');
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', 'admin')
      .single();
    
    if (userError || !adminUser) {
      throw new Error(`获取admin用户失败: ${userError?.message || '用户不存在'}`);
    }
    
    console.log(`✓ 找到admin用户: ${adminUser.id}`);
    
    // 4. 获取admin用户的角色
    console.log('4. 获取admin用户的角色...');
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles(
          id,
          name,
          display_name
        )
      `)
      .eq('user_id', adminUser.id);
    
    if (roleError || !userRoles || userRoles.length === 0) {
      throw new Error(`获取admin用户角色失败: ${roleError?.message || '用户没有角色'}`);
    }
    
    const adminRole = userRoles[0].roles;
    console.log(`✓ 找到admin角色: ${adminRole.name} (${adminRole.id})`);
    
    // 5. 检查角色是否已有permission.config权限
    console.log('5. 检查角色权限...');
    const { data: existingRolePermission, error: checkError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', adminRole.id)
      .eq('permission_id', permissionData.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`检查角色权限失败: ${checkError.message}`);
    }
    
    // 6. 如果角色没有该权限，添加它
    if (!existingRolePermission) {
      console.log('6. 为admin角色添加permission.config权限...');
      const { error: assignError } = await supabase
        .from('role_permissions')
        .insert({
          role_id: adminRole.id,
          permission_id: permissionData.id,
          created_by: adminUser.id
        });
      
      if (assignError) {
        throw new Error(`分配权限失败: ${assignError.message}`);
      }
      
      console.log('✓ admin角色已添加permission.config权限');
    } else {
      console.log('✓ admin角色已经拥有permission.config权限');
    }
    
    // 7. 验证修复结果
    console.log('7. 验证修复结果...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select(`
        username,
        user_roles(
          roles(
            name,
            role_permissions(
              permissions(
                code,
                name
              )
            )
          )
        )
      `)
      .eq('username', 'admin')
      .single();
    
    if (verifyError) {
      throw new Error(`验证失败: ${verifyError.message}`);
    }
    
    const adminPermissions = verifyData.user_roles
      .flatMap(ur => ur.roles.role_permissions)
      .map(rp => rp.permissions.code);
    
    if (adminPermissions.includes('permission.config')) {
      console.log('✅ 修复成功！admin用户现在拥有permission.config权限');
      console.log('admin用户的所有权限:', adminPermissions);
    } else {
      console.log('❌ 修复失败！admin用户仍然没有permission.config权限');
    }
    
  } catch (error) {
    console.error('修复过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行修复
fixAdminPermissions().then(() => {
  console.log('权限修复完成');
  process.exit(0);
});