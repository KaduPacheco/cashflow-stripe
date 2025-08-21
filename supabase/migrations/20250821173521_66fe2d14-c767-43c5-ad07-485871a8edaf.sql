-- Fix function search path security issues for enhanced profile security
-- This addresses the security linter warnings about mutable search paths

-- Fix audit_profile_changes function with proper search path
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

-- Fix validate_profile_access function with proper search path
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';