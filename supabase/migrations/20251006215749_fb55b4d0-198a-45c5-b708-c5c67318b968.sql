-- Drop existing profiles RLS policies
DROP POLICY IF EXISTS "Enhanced profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON public.profiles;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS validate_profile_access_trigger ON public.profiles;
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;

-- Create explicit, secure RLS policies for profiles table
-- Users can only SELECT their own profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only UPDATE their own profile  
CREATE POLICY "Users can only update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can only INSERT their own profile (during signup)
CREATE POLICY "Users can only create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Prevent all profile deletions
CREATE POLICY "No one can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- Add triggers to validate profile access and audit sensitive changes
CREATE TRIGGER validate_profile_access_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_access();

CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();