import type { Pack } from "../../types/pack";

interface PackStatsProps {
  pack: Pack;
}

interface StatCardProps {
  label: string;
  value: string | number;
  isLarge?: boolean;
}

function StatCard({ label, value, isLarge = false }: StatCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p
        className={isLarge ? "text-lg font-semibold" : "text-2xl font-semibold"}
      >
        {value}
      </p>
    </div>
  );
}

export function PackStats({ pack }: PackStatsProps) {
  const stats = [
    {
      label: "Contribution",
      value: `₦${pack.contribution.toLocaleString()}`,
    },
    {
      label: "Target Amount",
      value: `₦${pack.targetAmount.toLocaleString()}`,
    },
    {
      label: "Current Contributions",
      value: `₦${pack.currentContributions.toLocaleString()}`,
    },
    {
      label: "Total Contributions",
      value: `₦${pack.totalContributions.toLocaleString()}`,
    },
    {
      label: "Members",
      value: pack.totalMembers,
    },
    {
      label: "Current Round",
      value: `${pack.currentRound} / ${pack.totalMembers}`,
    },
    {
      label: "Created By",
      value: pack.createdByUser?.name || "Admin",
      isLarge: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          isLarge={stat.isLarge}
        />
      ))}
    </div>
  );
}
