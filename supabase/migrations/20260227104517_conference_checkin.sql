-- Conference Check-In System Migration
-- Tables: user_profiles, participants, check_in_logs

-- 1. TYPES
DROP TYPE IF EXISTS public.staff_role CASCADE;
CREATE TYPE public.staff_role AS ENUM ('admin', 'staff');

DROP TYPE IF EXISTS public.ticket_type CASCADE;
CREATE TYPE public.ticket_type AS ENUM ('VIP Pass', 'General Admission', 'Early Bird', 'Student Pass', 'Speaker Pass');

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role public.staff_role DEFAULT 'staff'::public.staff_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    ticket_type public.ticket_type DEFAULT 'General Admission'::public.ticket_type,
    qr_id TEXT UNIQUE,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    imported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.check_in_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL DEFAULT 'check_in',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_full_name ON public.participants(full_name);
CREATE INDEX IF NOT EXISTS idx_participants_qr_id ON public.participants(qr_id);
CREATE INDEX IF NOT EXISTS idx_participants_checked_in ON public.participants(checked_in);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_participant_id ON public.check_in_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_staff_id ON public.check_in_logs(staff_id);

-- 4. FUNCTIONS (BEFORE RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')::public.staff_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin' OR au.raw_app_meta_data->>'role' = 'admin')
    )
$$;

-- 5. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "authenticated_read_user_profiles" ON public.user_profiles;
CREATE POLICY "authenticated_read_user_profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (true);

-- participants: all authenticated staff can read/write
DROP POLICY IF EXISTS "authenticated_manage_participants" ON public.participants;
CREATE POLICY "authenticated_manage_participants"
ON public.participants FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- check_in_logs: all authenticated staff can read/write
DROP POLICY IF EXISTS "authenticated_manage_check_in_logs" ON public.check_in_logs;
CREATE POLICY "authenticated_manage_check_in_logs"
ON public.check_in_logs FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_participants_updated_at ON public.participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON public.participants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. MOCK DATA
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    staff1_uuid UUID := gen_random_uuid();
    staff2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users (trigger creates user_profiles automatically)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@conference.com', crypt('Admin@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Sarah Johnson', 'role', 'admin'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (staff1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'staff1@conference.com', crypt('Staff@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Michael Chen', 'role', 'staff'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (staff2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'staff2@conference.com', crypt('Staff@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Emily Rodriguez', 'role', 'staff'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Insert sample participants
    INSERT INTO public.participants (id, full_name, email, phone, ticket_type, qr_id, checked_in, checked_in_at, checked_in_by)
    VALUES
        (gen_random_uuid(), 'Alice Thompson', 'alice.thompson@email.com', '+1 (555) 100-0001', 'VIP Pass'::public.ticket_type, 'QR-001', false, null, null),
        (gen_random_uuid(), 'Bob Martinez', 'bob.martinez@email.com', '+1 (555) 100-0002', 'General Admission'::public.ticket_type, 'QR-002', true, now() - interval '2 hours', admin_uuid),
        (gen_random_uuid(), 'Carol Davis', 'carol.davis@email.com', '+1 (555) 100-0003', 'Early Bird'::public.ticket_type, 'QR-003', false, null, null),
        (gen_random_uuid(), 'Daniel Wilson', 'daniel.wilson@email.com', '+1 (555) 100-0004', 'Student Pass'::public.ticket_type, 'QR-004', false, null, null),
        (gen_random_uuid(), 'Eva Johnson', 'eva.johnson@email.com', '+1 (555) 100-0005', 'VIP Pass'::public.ticket_type, 'QR-005', true, now() - interval '1 hour', staff1_uuid),
        (gen_random_uuid(), 'Frank Brown', 'frank.brown@email.com', '+1 (555) 100-0006', 'General Admission'::public.ticket_type, 'QR-006', false, null, null),
        (gen_random_uuid(), 'Grace Lee', 'grace.lee@email.com', '+1 (555) 100-0007', 'Speaker Pass'::public.ticket_type, 'QR-007', true, now() - interval '30 minutes', admin_uuid),
        (gen_random_uuid(), 'Henry Clark', 'henry.clark@email.com', '+1 (555) 100-0008', 'Early Bird'::public.ticket_type, 'QR-008', false, null, null),
        (gen_random_uuid(), 'Isabella White', 'isabella.white@email.com', '+1 (555) 100-0009', 'General Admission'::public.ticket_type, 'QR-009', false, null, null),
        (gen_random_uuid(), 'James Harris', 'james.harris@email.com', '+1 (555) 100-0010', 'VIP Pass'::public.ticket_type, 'QR-010', true, now() - interval '45 minutes', staff1_uuid)
    ON CONFLICT (email) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
