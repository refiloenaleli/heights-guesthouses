import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : authError.message,
        );
        return;
      }

      if (data.user) {
        const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });

        if (roleError) {
          setError(`Could not verify admin access: ${roleError.message}`);
          await supabase.auth.signOut().catch(() => {});
          return;
        }

        if (!isAdmin) {
          setError(
            "This account does not have admin access. Ask the site owner to grant your account the admin role.",
          );
          await supabase.auth.signOut().catch(() => {});
          return;
        }

        navigate({ to: "/admin/dashboard" });
      }
    } catch (thrown) {
      setError(
        `Something went wrong while signing in: ${thrown instanceof Error ? thrown.message : "unknown error"}. Check your internet connection and try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-gold-dark">
            <Lock className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-heading text-3xl text-warm-white">Admin Portal</h1>
          <p className="text-sm text-warm-white/60 mt-2">Sign in to manage your guest houses</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-charcoal-light border border-gold/20 p-8 space-y-5"
        >
          {error && (
            <div className="bg-destructive/20 border border-destructive/30 text-destructive-foreground px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs tracking-widest uppercase text-gold-light mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-dark/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gold/20 bg-charcoal px-10 py-3 text-sm text-warm-white placeholder:text-warm-white/30 focus:outline-none focus:border-gold-dark"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-gold-light mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-dark/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gold/20 bg-charcoal px-10 py-3 text-sm text-warm-white placeholder:text-warm-white/30 focus:outline-none focus:border-gold-dark"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-dark/50 hover:text-gold-light"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/home"
            className="text-xs text-gold-light/60 hover:text-gold-light tracking-wider uppercase"
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
