-- SmartLis 智能实验室管理系统 - 创建管理员用户
-- 创建时间: 2025-01-20
-- 创建人: Erikwang
-- 描述: 通过Supabase Auth API创建admin用户，并在public.users表中创建对应记录

-- =============================================================================
-- 1. 创建管理员用户函数
-- =============================================================================

-- 创建一个函数来通过Supabase Auth创建用户
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- 检查是否已存在admin用户
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'admin@smartlis.com';
    
    -- 如果用户不存在，则创建
    IF existing_user_id IS NULL THEN
        -- 生成新的UUID
        admin_user_id := gen_random_uuid();
        
        -- 在auth.users表中插入用户记录
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@smartlis.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"username": "admin", "real_name": "系统管理员"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- 在auth.identities表中插入身份记录
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id::text,
            admin_user_id,
            format('{"sub": "%s", "email": "admin@smartlis.com"}', admin_user_id)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    ELSE
        admin_user_id := existing_user_id;
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- 检查public.users表中是否存在对应记录
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id) THEN
        -- 删除旧的占位符记录（如果存在）
        DELETE FROM public.user_roles WHERE user_id = 'b50e8400-e29b-41d4-a716-446655440001';
        DELETE FROM public.users WHERE id = 'b50e8400-e29b-41d4-a716-446655440001';
        
        -- 在public.users表中插入用户记录
        INSERT INTO public.users (
            id,
            username,
            email,
            password_hash,
            real_name,
            department,
            position,
            status,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'admin',
            'admin@smartlis.com',
            crypt('admin123', gen_salt('bf')),
            '系统管理员',
            'IT部门',
            '系统管理员',
            'active',
            NOW(),
            NOW()
        );
        
        -- 为管理员分配系统管理员角色
        INSERT INTO public.user_roles (user_id, role_id) VALUES
        (admin_user_id, '550e8400-e29b-41d4-a716-446655440001');
        
        RAISE NOTICE 'Public user record created for admin user';
    ELSE
        RAISE NOTICE 'Public user record already exists for admin user';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating admin user: %', SQLERRM;
END;
$$;

-- =============================================================================
-- 2. 执行创建管理员用户
-- =============================================================================

-- 执行函数创建管理员用户
SELECT create_admin_user();

-- 删除临时函数
DROP FUNCTION IF EXISTS create_admin_user();

-- =============================================================================
-- 3. 验证创建结果
-- =============================================================================

-- 验证auth.users表中的记录
DO $$
DECLARE
    auth_count INTEGER;
    public_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'admin@smartlis.com';
    SELECT COUNT(*) INTO public_count FROM public.users WHERE email = 'admin@smartlis.com';
    
    RAISE NOTICE 'Auth users count: %, Public users count: %', auth_count, public_count;
    
    IF auth_count > 0 AND public_count > 0 THEN
        RAISE NOTICE 'Admin user created successfully!';
        RAISE NOTICE 'Login credentials: admin@smartlis.com / admin123 or admin / admin123';
    ELSE
        RAISE WARNING 'Admin user creation may have failed. Auth: %, Public: %', auth_count, public_count;
    END IF;
END;
$$;

-- 提示信息
SELECT 'Admin user setup completed!' AS message;
SELECT 'You can now login with: admin@smartlis.com / admin123 or admin / admin123' AS login_info;