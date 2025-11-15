import type { Pack } from "../../types/pack";

interface PackHeaderProps {
  pack: Pack;
}

export function PackHeader({ pack }: PackHeaderProps) {
  return (
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
      </div>
    </div>
  );
}

