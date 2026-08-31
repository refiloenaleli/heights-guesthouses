import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Temporary bypass: send all admin traffic straight to the dashboard
 * while the admin auth flow is being fixed.
 */
export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});