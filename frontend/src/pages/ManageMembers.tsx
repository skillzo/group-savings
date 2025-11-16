import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import { getRoute } from "../utils/constants";

interface Member {
  id: string;
  userId: string;
  packId: string;
  order: number;
  hasReceived: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ManageMembers() {
  const { packId } = useParams<{ packId: string }>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState("");

  // Placeholder data
  const members: Member[] = [
    {
      id: "m1",
      userId: "u1",
      packId: packId || "1",
      order: 1,
      hasReceived: false,
      joinedAt: "2024-01-15T10:00:00Z",
      user: { id: "u1", name: "John Doe", email: "john@example.com" },
    },
    {
      id: "m2",
      userId: "u2",
      packId: packId || "1",
      order: 2,
      hasReceived: false,
      joinedAt: "2024-01-15T10:05:00Z",
      user: { id: "u2", name: "Jane Smith", email: "jane@example.com" },
    },
    {
      id: "m3",
      userId: "u3",
      packId: packId || "1",
      order: 3,
      hasReceived: false,
      joinedAt: "2024-01-15T10:10:00Z",
      user: { id: "u3", name: "Mike Johnson", email: "mike@example.com" },
    },
  ];

  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  const handleAddMember = () => {
    // Simulate API call
    setShowAddModal(false);
    setEmailToAdd("");
  };

  const handleRemoveMember = (memberId: string) => {
    // Simulate API call
    console.log("Remove member:", memberId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          {packId && (
            <Link
              to={getRoute.packDetails(packId)}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              ← Back to Pack
            </Link>
          )}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Manage Members
            </h1>
            <p className="text-sm text-muted-foreground">
              Add or remove members from this pack
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="px-4 py-2 text-sm"
          >
            + Add Member
          </Button>
        </div>

        {/* Members Table */}
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium text-sm">
                        {member.order}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{member.user.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {member.hasReceived ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          Received
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-semibold tracking-tight mb-4">
                  Add Member
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddMember();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Member Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailToAdd}
                      onChange={(e) => setEmailToAdd(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                    >
                      Add Member
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      variant="secondary"
                      className="px-6 py-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
