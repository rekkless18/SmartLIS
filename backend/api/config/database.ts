/**
 * 数据库连接配置
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * Supabase客户端配置
 * @description 创建Supabase数据库连接客户端
 * @returns Supabase客户端实例
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('缺少Supabase配置参数：SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
}

// 创建Supabase客户端（使用服务端密钥，拥有完整权限）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * 测试数据库连接
 * @description 测试与Supabase数据库的连接是否正常
 * @returns Promise<boolean> 连接是否成功
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('数据库连接测试失败:', error.message);
      return false;
    }
    
    console.log('数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('数据库连接测试异常:', error);
    return false;
  }
}

/**
 * 数据库配置信息
 */
export const dbConfig = {
  url: supabaseUrl,
  connected: false
};