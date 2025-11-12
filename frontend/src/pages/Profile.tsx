import { Link } from "react-router-dom";
import { useState } from "react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "bank">("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder user data
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 800 000 0000",
  });

  const [bankData, setBankData] = useState({
    accountNumber: "1234567890",
    accountName: "John Doe",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Simulate API call
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Profile & Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and bank details
          </p>
        </div>

        {/* Tabs */}
        <div className="border rounded-lg mb-6 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-3 text-center text-sm font-medium transition-colors border-b-2 ${
                activeTab === "profile"
                  ? "bg-muted/50 text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:bg-muted/30"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex-1 px-6 py-3 text-center text-sm font-medium transition-colors border-b-2 ${
                activeTab === "bank"
                  ? "bg-muted/50 text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:bg-muted/30"
              }`}
            >
              Bank Details
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="border rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Personal Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      isEditing ? "border-input" : "border-input bg-muted"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      isEditing ? "border-input" : "border-input bg-muted"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      isEditing ? "border-input" : "border-input bg-muted"
                    }`}
                    placeholder="+234 800 000 0000"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Tab */}
        {activeTab === "bank" && (
          <div className="border rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Bank Details
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for receiving payouts from packs
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-medium mb-2"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      isEditing ? "border-input" : "border-input bg-muted"
                    }`}
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label
                    htmlFor="accountName"
                    className="block text-sm font-medium mb-2"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={bankData.accountName}
                    onChange={handleBankChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      isEditing ? "border-input" : "border-input bg-muted"
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
