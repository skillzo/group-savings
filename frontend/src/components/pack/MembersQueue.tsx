import type { PackMember } from "../../types/pack";

interface MembersQueueProps {
  members: PackMember[];
  nextInLine?: PackMember;
}

export function MembersQueue({ members, nextInLine }: MembersQueueProps) {
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  return (
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
                  Has Received
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {" "}
                  Has Contributed{" "}
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

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {member.hasContributed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                        No
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
  );
}
