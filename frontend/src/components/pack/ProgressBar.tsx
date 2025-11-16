import type { Pack } from "../../types/pack";

interface ProgressBarProps {
  pack: Pack;
}

const roundProgress = (currentRound: number, totalMembers: number) => {
  return (currentRound / totalMembers) * 100;
};

export function ProgressBar({ pack }: ProgressBarProps) {
  const progress = roundProgress(
    pack.currentContributions,
    pack.totalContributions
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Round Progress</span>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
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
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
