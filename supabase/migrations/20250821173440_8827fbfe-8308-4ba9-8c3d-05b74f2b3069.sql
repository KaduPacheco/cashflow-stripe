-- Enhanced RLS policies for profiles table to prevent unauthorized access to personal information
-- This addresses potential security vulnerabilities in customer data access

-- First, drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Enhanced SELECT policy with stricter authentication checks
CREATE POLICY "Enhanced profiles select policy" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  -- User can only access their own profile AND must be authenticated
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
  -- Additional check to ensure the user is actually authenticated
  AND auth.role() = 'authenticated'
);

-- Enhanced UPDATE policy with data integrity checks
CREATE POLICY "Enhanced profiles update policy" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- User can only update their own profile
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  -- Prevent changing the ID field and ensure user consistency
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
  AND auth.role() = 'authenticated'
);

-- Enhanced INSERT policy with strict validation
CREATE POLICY "Enhanced profiles insert policy" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only authenticated users can insert their own profile
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
  AND auth.role() = 'authenticated'
  -- Prevent creating profiles for other users
  AND id = auth.uid()
);

-- Secure admin access policy using security definer function
CREATE POLICY "Secure admin profiles access" ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only verified admins can access all profiles
  auth.uid() IS NOT NULL
  AND auth.role() = 'authenticated'
  AND public.is_user_admin(auth.uid()) = true
);

-- Add a policy to prevent unauthorized DELETE operations
CREATE POLICY "Prevent profile deletion" ON public.profiles
FOR DELETE
TO authenticated
USING (false); -- No one can delete profiles for data retention

-- Create a security audit trigger for sensitive profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any changes to sensitive profile fields
  IF (OLD.email IS DISTINCT FROM NEW.email 
      OR OLD.phone IS DISTINCT FROM NEW.phone 
      OR OLD.whatsapp IS DISTINCT FROM NEW.whatsapp) THEN
    
    PERFORM public.log_security_event(
      'profile_sensitive_update',
      'profiles',
      NEW.id::text,
      true,
      jsonb_build_object(
        'changed_fields', 
        CASE 
          WHEN OLD.email IS DISTINCT FROM NEW.email THEN jsonb_build_array('email')
          ELSE '[]'::jsonb
        END ||
        CASE 
          WHEN OLD.phone IS DISTINCT FROM NEW.phone THEN jsonb_build_array('phone')
          ELSE '[]'::jsonb
        END ||
        CASE 
          WHEN OLD.whatsapp IS DISTINCT FROM NEW.whatsapp THEN jsonb_build_array('whatsapp')
          ELSE '[]'::jsonb
        END,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile change auditing
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- Create a function to validate profile data access patterns
CREATE OR REPLACE FUNCTION public.validate_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure authenticated user context
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized access: No authenticated user';
  END IF;
  
  -- Prevent mass data export attempts
  IF TG_OP = 'SELECT' AND current_setting('transaction_isolation', true) = 'read uncommitted' THEN
    RAISE EXCEPTION 'Suspicious data access pattern detected';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add validation trigger (note: this is for demonstration, SELECT triggers are limited in PostgreSQL)
-- In practice, this validation would be done at the application level

-- Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
REVOKE DELETE ON public.profiles FROM authenticated;