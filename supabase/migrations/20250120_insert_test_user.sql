-- 插入测试用户数据
-- 注意：这个脚本假设已经通过Supabase Auth注册了用户
-- 我们只需要在public.users表中插入对应的用户信息

-- 插入测试用户（假设已通过Supabase Auth注册）
INSERT INTO public.users (
  id,
  username,
  email,
  password_hash,
  real_name,
  phone,
  department,
  position,
  status
) VALUES (
  gen_random_uuid(),
  'testuser',
  'test@example.com',
  'dummy-hash', -- 这个字段在使用Supabase Auth时不会被使用
  '测试用户',
  '13800138000',
  '技术部',
  '工程师',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 检查权限设置
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;