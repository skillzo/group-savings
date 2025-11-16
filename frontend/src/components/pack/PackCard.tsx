import { Link } from "react-router-dom";
import type { Pack } from "../../types/pack";
import { getRoute } from "../../utils/constants";

interface PackCardProps {
  pack: Pack;
}

const roundProgress = (currentRound: number, totalMembers: number) => {
  if (totalMembers === 0) return 0;
  return (currentRound / totalMembers) * 100 || 0;
};

export function PackCard({ pack }: PackCardProps) {
  return (
    <Link
      to={getRoute.packDetails(pack.id)}
      className="group block border rounded-lg p-6 hover:bg-accent/50 transition-colors"
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

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">
            Round {pack.currentRound} / {pack.totalMembers}
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
              width:
                `${roundProgress(pack.currentRound, pack.totalMembers)}%` ||
                "0%",
            }}
          />
        </div>
      </div>

      {/* Pack Details */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contribution</span>
          <span className="font-medium">
            ₦{pack.contribution.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target Amount</span>
          <span className="font-medium">
            ₦{pack.targetAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Contributions</span>
          <span className="font-medium">
            ₦{pack.currentContributions.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Contributions</span>
          <span className="font-medium">
            ₦{pack.totalContributions.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Members</span>
          <span className="font-medium">{pack.totalMembers}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t text-xs text-muted-foreground">
        <div className="mb-1">
          Created by{" "}
          <span className="font-medium">
            {pack.createdByUser?.name || "Unknown"}
          </span>
        </div>
        <div>
          {new Date(pack.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
    </Link>
  );
}
