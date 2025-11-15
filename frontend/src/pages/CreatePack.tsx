import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/Button";

export default function CreatePack() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    contribution: "",
    targetAmount: "",
    totalMembers: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Pack name is required";
    }

    const contribution = parseFloat(formData.contribution);
    if (!formData.contribution || contribution <= 0) {
      newErrors.contribution = "Contribution must be greater than 0";
    }

    const totalMembers = parseInt(formData.totalMembers);
    if (!formData.totalMembers || totalMembers <= 0) {
      newErrors.totalMembers = "Total members must be greater than 0";
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (!formData.targetAmount || targetAmount <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0";
    }

    // Validate: contribution × members = target
    if (
      contribution > 0 &&
      totalMembers > 0 &&
      targetAmount > 0 &&
      contribution * totalMembers !== targetAmount
    ) {
      newErrors.targetAmount =
        "Target amount must equal contribution × total members";
      newErrors.contribution =
        "Contribution × total members must equal target amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to pack details or dashboard
      navigate("/");
    }, 1000);
  };

  const calculateTarget = () => {
    const contribution = parseFloat(formData.contribution);
    const totalMembers = parseInt(formData.totalMembers);
    if (contribution > 0 && totalMembers > 0) {
      return contribution * totalMembers;
    }
    return 0;
  };

  const autoFillTarget = () => {
    const calculated = calculateTarget();
    if (calculated > 0) {
      setFormData((prev) => ({ ...prev, targetAmount: calculated.toString() }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Form Card */}
        <div className="border rounded-lg">
          <div className="p-8">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Create New Pack
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Set up a new savings group with your preferred contribution and
              target amounts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pack Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Pack Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                    errors.name ? "border-destructive" : "border-input"
                  }`}
                  placeholder="e.g., Family Savings Pack"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Contribution and Total Members Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contribution"
                    className="block text-sm font-medium mb-2"
                  >
                    Contribution Amount (₦) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    id="contribution"
                    name="contribution"
                    value={formData.contribution}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      errors.contribution ? "border-destructive" : "border-input"
                    }`}
                    placeholder="10000"
                    min="1"
                    step="1"
                  />
                  {errors.contribution && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.contribution}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="totalMembers"
                    className="block text-sm font-medium mb-2"
                  >
                    Total Members <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    id="totalMembers"
                    name="totalMembers"
                    value={formData.totalMembers}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                      errors.totalMembers ? "border-destructive" : "border-input"
                    }`}
                    placeholder="10"
                    min="2"
                    step="1"
                  />
                  {errors.totalMembers && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.totalMembers}
                    </p>
                  )}
                </div>
              </div>

              {/* Auto-calculate helper */}
              {parseFloat(formData.contribution) > 0 &&
                parseInt(formData.totalMembers) > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Calculated Target Amount
                        </p>
                        <p className="text-2xl font-semibold mt-1">
                          ₦{calculateTarget().toLocaleString()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={autoFillTarget}
                        variant="primary"
                        className="px-4 py-2 text-sm"
                      >
                        Use This Amount
                      </Button>
                    </div>
                  </div>
                )}

              {/* Target Amount */}
              <div>
                <label
                  htmlFor="targetAmount"
                  className="block text-sm font-medium mb-2"
                >
                  Target Amount (₦) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
                    errors.targetAmount ? "border-destructive" : "border-input"
                  }`}
                  placeholder="100000"
                  min="1"
                  step="1"
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.targetAmount}
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  Must equal: Contribution × Total Members
                </p>
              </div>

              {/* Validation Summary */}
              {parseFloat(formData.contribution) > 0 &&
                parseInt(formData.totalMembers) > 0 &&
                parseFloat(formData.targetAmount) > 0 && (
                  <div
                    className={`p-4 rounded-lg border ${
                      parseFloat(formData.contribution) *
                        parseInt(formData.totalMembers) ===
                      parseFloat(formData.targetAmount)
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {parseFloat(formData.contribution) *
                        parseInt(formData.totalMembers) ===
                      parseFloat(formData.targetAmount) ? (
                        <>
                          <svg
                            className="w-5 h-5 text-green-600"
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
                          <p className="text-sm font-medium text-green-800">
                            Validation passed! Contribution × Members = Target
                          </p>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <p className="text-sm font-medium text-red-800">
                            Validation failed! Contribution × Members must equal
                            Target Amount
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="flex-1 px-6 py-3"
                >
                  {isSubmitting ? "Creating..." : "Create Pack"}
                </Button>
                <Link to="/">
                  <Button variant="secondary" className="px-6 py-3">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


