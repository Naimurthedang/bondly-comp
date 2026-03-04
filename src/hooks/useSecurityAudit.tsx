import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useSecurityAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: string,
    resource?: string,
    metadata?: Record<string, string | number | boolean | null>
  ) => {
    if (!user) return;
    
    try {
      await supabase.from("security_audit_log").insert([{
        user_id: user.id,
        action,
        resource,
        metadata: metadata || {},
      }]);
    } catch (e) {
      console.warn("[AUDIT] Failed to log action:", action, e);
    }
  }, [user]);

  return { logAction };
};
