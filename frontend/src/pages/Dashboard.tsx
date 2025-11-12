import { Link } from 'react-router-dom';

interface Pack {
  id: string;
  name: string;
  contribution: number;
  targetAmount: number;
  totalMembers: number;
  currentRound: number;
  status: 'ACTIVE' | 'COMPLETED' | 'INACTIVE';
  createdAt: string;
}

interface PackMember {
  id: string;
  userId: string;
  packId: string;
  order: number;
  hasReceived: boolean;
  joinedAt: string;
}

export default function Dashboard() {
  // Placeholder data
  const userPacks: Pack[] = [
    {
      id: '1',
      name: 'Family Savings Pack',
      contribution: 10000,
      targetAmount: 100000,
      totalMembers: 10,
      currentRound: 1,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Vacation Fund',
      contribution: 50000,
      targetAmount: 500000,
      totalMembers: 10,
      currentRound: 3,
      status: 'ACTIVE',
      createdAt: '2024-01-10T10:00:00Z',
    },
  ];

  const myMemberships: PackMember[] = [
    {
      id: 'm1',
      userId: 'user1',
      packId: '1',
      order: 3,
      hasReceived: false,
      joinedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'm2',
      userId: 'user1',
      packId: '2',
      order: 7,
      hasReceived: false,
      joinedAt: '2024-01-10T11:00:00Z',
    },
  ];

  const totalContributions = userPacks.reduce(
    (sum, pack) => sum + pack.contribution * pack.currentRound,
    0,
  );
  const activePacksCount = userPacks.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your savings packs
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/payouts"
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              Payouts
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              Profile
            </Link>
            <Link
              to="/packs"
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              Browse Packs
            </Link>
            <Link
              to="/packs/create"
              className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
            >
              Create Pack
            </Link>
          </div>
        </div>

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
            <p className="text-3xl font-semibold">{myMemberships.length}</p>
          </div>
        </div>

        {/* My Packs Section */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">My Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPacks.map((pack) => {
              const membership = myMemberships.find((m) => m.packId === pack.id);
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
                        pack.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : pack.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pack.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contribution:</span>
                      <span className="font-medium">₦{pack.contribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">₦{pack.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Round:</span>
                      <span className="font-medium">
                        {pack.currentRound} / {pack.totalMembers}
                      </span>
                    </div>
                    {membership && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your Order:</span>
                          <span className="font-medium">{membership.order}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">Received:</span>
                          <span
                            className={`font-medium ${
                              membership.hasReceived ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {membership.hasReceived ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

