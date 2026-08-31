import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * /admin — convenience entry point.
 * Sends logged-in admins straight to the dashboard,
 * everyone else to the login page.
 */
export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (data) {
        throw redirect({ to: "/admin/dashboard" });
      }
    }

    throw redirect({ to: "/admin/login" });
  },
});