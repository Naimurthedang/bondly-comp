
-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role / edge functions should manage rate limits
CREATE POLICY "Authenticated users can insert rate limits"
ON public.rate_limits FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view own rate limits"
ON public.rate_limits FOR SELECT TO authenticated
USING (true);

-- Fix audit log insert - restrict to own user_id
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Users can insert own audit logs"
ON public.security_audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
