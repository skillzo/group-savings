import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";

interface Pack {
  id: string;
  name: string;
  contribution: number;
  targetAmount: number;
  totalMembers: number;
  currentRound: number;
  status: "ACTIVE" | "COMPLETED" | "INACTIVE";
  createdAt: string;
}

interface PackMember {
  id: string;
  order: number;
  hasReceived: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface PackWithMembership extends Pack {
  membership?: PackMember;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [userPacks, setUserPacks] = useState<PackWithMembership[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user packs and total contributions in parallel
        const [packsData, paymentsData] = await Promise.all([
          api.getUserPacks(user.id) as Promise<Pack[]>,
          api.getUserPayments(user.id) as Promise<{
            payments: any[];
            totalContributions: number;
          }>,
        ]);

        // Set total contributions
        setTotalContributions(paymentsData.totalContributions || 0);

        // Fetch members for each pack to get user's membership details
        const packsWithMemberships = await Promise.all(
          packsData.map(async (pack) => {
            try {
              const members = (await api.getPackMembers(
                pack.id
              )) as PackMember[];
              const membership = members.find((m) => m.user.id === user.id);
              return { ...pack, membership };
            } catch (err) {
              console.error(`Error fetching members for pack ${pack.id}:`, err);
              return { ...pack, membership: undefined };
            }
          })
        );

        setUserPacks(packsWithMemberships);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const activePacksCount = userPacks.filter(
    (p) => p.status === "ACTIVE"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 mx-auto mb-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border border-destructive rounded-lg p-6 bg-destructive/10">
            <p className="text-destructive font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={user?.name}
      subtitle="Overview of your savings packs"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Active Packs
          </h3>
          <p className="text-3xl font-semibold">{activePacksCount}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Contributions
          </h3>
          <p className="text-3xl font-semibold">
            ₦{totalContributions.toLocaleString()}
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            My Packs
          </h3>
          <p className="text-3xl font-semibold">{userPacks.length}</p>
        </div>
      </div>

      {/* My Packs Section */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">My Packs</h2>
        {userPacks.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              You haven't joined any packs yet.
            </p>
            <Link to="/packs" className="mt-4 inline-block">
              <Button variant="primary">Browse Packs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPacks.map((pack) => {
              return (
                <Link
                  key={pack.id}
                  to={`/packs/${pack.id}`}
                  className="block border rounded-lg p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{pack.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        pack.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : pack.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pack.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Contribution:
                      </span>
                      <span className="font-medium">
                        ₦{pack.contribution.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">
                        ₦{pack.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Round:</span>
                      <span className="font-medium">
                        {pack.currentRound} / {pack.totalMembers}
                      </span>
                    </div>
                    {pack.membership && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Your Order:
                          </span>
                          <span className="font-medium">
                            {pack.membership.order}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">
                            Received:
                          </span>
                          <span
                            className={`font-medium ${
                              pack.membership.hasReceived
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {pack.membership.hasReceived ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
