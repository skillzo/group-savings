import type { PackMember } from "../../types/pack";

interface NextInLineAlertProps {
  nextInLine: PackMember;
}

export function NextInLineAlert({ nextInLine }: NextInLineAlertProps) {
  return (
    <div className="border rounded-lg p-4 mb-6 bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
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
  );
}
