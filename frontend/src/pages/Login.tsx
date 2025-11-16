import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/user";
import { Button } from "../components/ui/Button";
import { routes } from "../utils/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = (await api.getUserByEmail(email)) as User;
      setUser(user);
      navigate(routes.dashboard);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 border border-destructive rounded-lg p-3 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={routes.register}
                className="text-foreground hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
