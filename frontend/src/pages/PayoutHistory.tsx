import { Link } from "react-router-dom";
import { routes, getRoute } from "../utils/constants";

interface Payout {
  id: string;
  packId: string;
  packName: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  order: number;
  createdAt: string;
  receivedAt?: string;
}

export default function PayoutHistory() {
  // Placeholder data
  const payouts: Payout[] = [
    {
      id: "p1",
      packId: "1",
      packName: "Family Savings Pack",
      amount: 100000,
      status: "SUCCESS",
      order: 1,
      createdAt: "2024-01-15T10:00:00Z",
      receivedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "p2",
      packId: "2",
      packName: "Vacation Fund",
      amount: 500000,
      status: "PENDING",
      order: 3,
      createdAt: "2024-01-20T10:00:00Z",
    },
    {
      id: "p3",
      packId: "3",
      packName: "Emergency Fund",
      amount: 200000,
      status: "SUCCESS",
      order: 5,
      createdAt: "2023-12-01T10:00:00Z",
      receivedAt: "2023-12-01T11:00:00Z",
    },
  ];

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");
  const completedPayouts = payouts.filter((p) => p.status === "SUCCESS");
  const totalReceived = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to={routes.dashboard}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Payout History
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your payouts from all savings packs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Received</p>
            <p className="text-3xl font-semibold text-green-600">
              ₦{totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Pending Payouts
            </p>
            <p className="text-3xl font-semibold text-orange-600">
              {pendingPayouts.length}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Completed Payouts
            </p>
            <p className="text-3xl font-semibold text-blue-600">
              {completedPayouts.length}
            </p>
          </div>
        </div>

        {/* Pending Payouts */}
        {pendingPayouts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Pending Payouts
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pack
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Expected Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={getRoute.packDetails(payout.packId)}
                            className="font-medium text-foreground hover:underline"
                          >
                            {payout.packName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">
                            #{payout.order}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold">
                            ₦{payout.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                            PENDING
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(payout.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Completed Payouts */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Completed Payouts
          </h2>
          {completedPayouts.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pack
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Received Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {completedPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={getRoute.packDetails(payout.packId)}
                            className="font-medium text-foreground hover:underline"
                          >
                            {payout.packName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">
                            #{payout.order}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold">
                            ₦{payout.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {payout.receivedAt
                            ? new Date(payout.receivedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            SUCCESS
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No completed payouts yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Your completed payouts will appear here once you receive them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
