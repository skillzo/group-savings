import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {title || user?.name || "Dashboard"}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Link to="/payouts">
              <Button variant="secondary">Payouts</Button>
            </Link>
            <Link to="/packs">
              <Button variant="secondary">Browse Packs</Button>
            </Link>
            <Link to="/packs/create">
              <Button variant="primary">Create Pack</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

