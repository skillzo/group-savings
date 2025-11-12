import { Link, useParams } from "react-router-dom";

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
  userId: string;
  packId: string;
  order: number;
  hasReceived: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface Payment {
  id: string;
  memberId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  type: "CONTRIBUTION" | "PAYOUT";
  createdAt: string;
}

export default function PackDetails() {
  const { id } = useParams<{ id: string }>();

  // Placeholder data
  const pack: Pack = {
    id: id || "1",
    name: "Family Savings Pack",
    contribution: 10000,
    targetAmount: 100000,
    totalMembers: 10,
    currentRound: 1,
    status: "ACTIVE",
    createdAt: "2024-01-15T10:00:00Z",
  };

  const members: PackMember[] = [
    {
      id: "m1",
      userId: "u1",
      packId: pack.id,
      order: 1,
      hasReceived: false,
      joinedAt: "2024-01-15T10:00:00Z",
      user: { id: "u1", name: "John Doe" },
    },
    {
      id: "m2",
      userId: "u2",
      packId: pack.id,
      order: 2,
      hasReceived: false,
      joinedAt: "2024-01-15T10:05:00Z",
      user: { id: "u2", name: "Jane Smith" },
    },
    {
      id: "m3",
      userId: "u3",
      packId: pack.id,
      order: 3,
      hasReceived: false,
      joinedAt: "2024-01-15T10:10:00Z",
      user: { id: "u3", name: "Mike Johnson" },
    },
    {
      id: "m4",
      userId: "u4",
      packId: pack.id,
      order: 4,
      hasReceived: false,
      joinedAt: "2024-01-15T10:15:00Z",
      user: { id: "u4", name: "Sarah Williams" },
    },
    {
      id: "m5",
      userId: "u5",
      packId: pack.id,
      order: 5,
      hasReceived: false,
      joinedAt: "2024-01-15T10:20:00Z",
      user: { id: "u5", name: "David Brown" },
    },
    {
      id: "m6",
      userId: "u6",
      packId: pack.id,
      order: 6,
      hasReceived: false,
      joinedAt: "2024-01-15T10:25:00Z",
      user: { id: "u6", name: "Emily Davis" },
    },
  ];

  const payments: Payment[] = [
    {
      id: "p1",
      memberId: "m1",
      amount: 10000,
      status: "SUCCESS",
      type: "CONTRIBUTION",
      createdAt: "2024-01-15T11:00:00Z",
    },
    {
      id: "p2",
      memberId: "m2",
      amount: 10000,
      status: "SUCCESS",
      type: "CONTRIBUTION",
      createdAt: "2024-01-15T11:05:00Z",
    },
    {
      id: "p3",
      memberId: "m3",
      amount: 10000,
      status: "SUCCESS",
      type: "CONTRIBUTION",
      createdAt: "2024-01-15T11:10:00Z",
    },
  ];

  const sortedMembers = [...members].sort((a, b) => a.order - b.order);
  const nextInLine = sortedMembers.find((m) => !m.hasReceived);

  const roundProgress = (currentRound: number, totalMembers: number) => {
    return (currentRound / totalMembers) * 100;
  };

  const totalContributions = payments
    .filter((p) => p.status === "SUCCESS" && p.type === "CONTRIBUTION")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to="/packs"
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Packs
          </Link>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Pack Header Card */}
        <div className="border rounded-lg mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight mb-2">
                  {pack.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created{" "}
                  {new Date(pack.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-medium ${
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Contribution</p>
                <p className="text-2xl font-semibold">
                  ₦{pack.contribution.toLocaleString()}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Target Amount</p>
                <p className="text-2xl font-semibold">
                  ₦{pack.targetAmount.toLocaleString()}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Members</p>
                <p className="text-2xl font-semibold">{pack.totalMembers}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Current Round</p>
                <p className="text-2xl font-semibold">
                  {pack.currentRound} / {pack.totalMembers}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Round Progress</span>
                <span className="text-sm font-medium">
                  {Math.round(roundProgress(pack.currentRound, pack.totalMembers))}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    pack.status === "ACTIVE"
                      ? "bg-green-600"
                      : pack.status === "COMPLETED"
                      ? "bg-blue-600"
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: `${roundProgress(pack.currentRound, pack.totalMembers)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next in Line Alert */}
        {nextInLine && (
          <div className="border rounded-lg p-4 mb-6 bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Next in Line for Payout
                </p>
                <p className="font-semibold">
                  {nextInLine.user.name}
                  <span className="text-muted-foreground font-normal ml-2">
                    (Order #{nextInLine.order})
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Members Queue */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Members Queue</h2>
            <span className="text-sm text-muted-foreground">
              {sortedMembers.length} members
            </span>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedMembers.map((member) => (
                    <tr
                      key={member.id}
                      className={`transition-colors ${
                        member.hasReceived
                          ? "bg-muted/30"
                          : member.order === nextInLine?.order
                          ? "bg-blue-50/50"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                            member.hasReceived
                              ? "bg-green-100 text-green-700"
                              : member.order === nextInLine?.order
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {member.order}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.user.name}</p>
                          {member.order === nextInLine?.order && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                              Next
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {member.hasReceived ? (
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
                            Received
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Payment History</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className="text-lg font-semibold">₦{totalContributions.toLocaleString()}</p>
            </div>
          </div>
          {payments.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                payment.type === "CONTRIBUTION"
                                  ? "bg-blue-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {payment.type === "CONTRIBUTION" ? (
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-green-600"
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
                              )}
                            </div>
                            <p className="font-medium">{payment.type}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${
                              payment.status === "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "PENDING"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {payment.status}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-sm text-muted-foreground">
                Payment history will appear here once contributions are made.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            to={`/packs/${pack.id}/payment`}
            className="flex-1 px-6 py-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium text-center"
          >
            Make Contribution
          </Link>
          <Link
            to={`/packs/${pack.id}/manage`}
            className="px-6 py-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
          >
            Manage Members
          </Link>
        </div>
      </div>
    </div>
  );
}
