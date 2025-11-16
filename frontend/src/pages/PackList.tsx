import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { routes } from "../utils/constants";
import { PackCard } from "../components/pack/PackCard";
import type { Pack } from "../types/pack";

export default function PackList() {
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "COMPLETED" | "INACTIVE"
  >("ALL");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = (await api.getAllPacks()) as Pack[];
        setPacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load packs");
        console.error("Error fetching packs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const filteredPacks =
    filter === "ALL" ? packs : packs.filter((pack) => pack.status === filter);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                All Packs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and join savings groups
              </p>
            </div>
            <Link
              to={routes.dashboard}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Packs</p>
              <p className="text-2xl font-semibold">{packs.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-2xl font-semibold text-green-600">
                {packs.filter((p) => p.status === "ACTIVE").length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-semibold text-blue-600">
                {packs.filter((p) => p.status === "COMPLETED").length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Filtered</p>
              <p className="text-2xl font-semibold">{filteredPacks.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex border rounded-lg p-1 mb-6 bg-muted/50">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "ALL"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "ACTIVE"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "COMPLETED"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("INACTIVE")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "INACTIVE"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {/* Empty State */}
        {filteredPacks.length === 0 && (
          <div className="text-center py-16 border rounded-lg">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No packs found</h3>
              <p className="text-sm text-muted-foreground">
                There are no packs matching the "{filter}" filter at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
