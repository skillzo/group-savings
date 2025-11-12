import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function MakePayment() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  // Placeholder pack data
  const pack = {
    id: packId || "1",
    name: "Family Savings Pack",
    contribution: 10000,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);
    setPaymentStatus("processing");

    // Simulate Flutterwave payment integration
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus("success");
      setTimeout(() => {
        navigate(`/packs/${packId}`);
      }, 2000);
    }, 2000);
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full border rounded-lg">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your contribution of ₦{parseFloat(amount).toLocaleString()} has
              been processed successfully.
            </p>
            <Link
              to={`/packs/${packId}`}
              className="inline-block px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium"
            >
              View Pack Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to={`/packs/${packId}`}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Pack
          </Link>
        </div>

        {/* Payment Form Card */}
        <div className="border rounded-lg">
          <div className="p-8">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Make Contribution
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Contribute to <span className="font-medium">{pack.name}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pack Info */}
              <div className="border rounded-lg p-6 bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Expected Contribution
                  </p>
                  <p className="text-2xl font-semibold">
                    ₦{pack.contribution.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-2"
                >
                  Contribution Amount (₦) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors text-lg"
                  placeholder={pack.contribution.toString()}
                  min="1"
                  step="1"
                  required
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the amount you want to contribute
                </p>
              </div>

              {/* Payment Method Info */}
              <div className="border rounded-lg p-6 bg-muted/30">
                <h3 className="text-sm font-medium mb-4">Payment Method</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Flutterwave Payment Gateway</p>
                    <p className="text-sm text-muted-foreground">
                      Secure payment processing
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className="w-full px-6 py-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
