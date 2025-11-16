import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/Button";
import { routes, getRoute } from "../utils/constants";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flutterwave returns tx_ref in query params, packId from redirect URL
  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef");
  const packId = searchParams.get("packId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txRef) {
        setError("No transaction reference found");
        setVerifying(false);
        return;
      }

      try {
        await api.verifyPayment(txRef);
        setVerified(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify payment. Please contact support."
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border rounded-lg p-8 text-center">
          {verifying ? (
            <>
              <div className="w-16 h-16 border-4 border-[#143564] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold mb-2">Verifying Payment</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            </>
          ) : verified ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h1 className="text-2xl font-semibold mb-2">
                Payment Successful!
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your contribution has been processed successfully. You will
                receive a confirmation shortly.
              </p>
              <div className="flex flex-col gap-3">
                <Link to={routes.dashboard}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                {packId && (
                  <Link to={getRoute.packDetails(packId)}>
                    <Button variant="secondary" className="w-full">
                      Back to Pack
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
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
              </div>
              <h1 className="text-2xl font-semibold mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <Link to={routes.dashboard}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to={routes.packs}>
                  <Button variant="secondary" className="w-full">
                    Browse Packs
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
