import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Loader } from "../components/Loader";
import {
  PaymentType,
  type Pack,
  type PackMember,
  type Payment,
} from "../types/pack";
import { PackHeader } from "../components/pack/PackHeader";
import { PackStats } from "../components/pack/PackStats";
import { ProgressBar } from "../components/pack/ProgressBar";
import { NextInLineAlert } from "../components/pack/NextInLineAlert";
import { MembersQueue } from "../components/pack/MembersQueue";
import { PaymentHistory } from "../components/pack/PaymentHistory";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { routes, getRoute } from "../utils/constants";

export default function PackDetails() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<Pack | null>(null);
  const [members, setMembers] = useState<PackMember[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [initiatingPayout, setInitiatingPayout] = useState(false);
  const [joiningPack, setJoiningPack] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [packData, membersData, paymentsData, requestData] =
          await Promise.all([
            api.getPackById(id) as Promise<Pack>,
            api.getPackMembers(id) as Promise<PackMember[]>,
            api.getPackPayments(id) as Promise<Payment[]>,
            api.getPaymentRequestByPack(id).catch(() => ({ paymentRequest: null })),
          ]);

        setPack(packData);
        setMembers(membersData);
        setPayments(paymentsData);
        setPaymentRequest(
          requestData &&
          typeof requestData === "object" &&
          requestData !== null &&
          "paymentRequest" in requestData
            ? (requestData as { paymentRequest: any }).paymentRequest
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load pack details"
        );
        console.error("Error fetching pack details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border border-destructive rounded-lg p-6 bg-destructive/10">
            <p className="text-destructive font-medium">
              Error: {error || "Pack not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nextInLine = members.find(
    (m) => !m.hasReceived && m.order === pack.currentRound
  );

  const userMembership = members.find((m) => m.user.id === user?.id);

  const handleMakeContribution = async () => {
    if (!userMembership || !pack) {
      setError("You are not a member of this pack");
      return;
    }

    try {
      setInitiatingPayment(true);
      setError(null);

      const result = await api.initiatePayment(
        userMembership.id,
        pack.contribution,
        PaymentType.CONTRIBUTION
      );

      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate payment. Please try again."
      );
      setInitiatingPayment(false);
    }
  };

  const handleJoinPack = async () => {
    if (!pack || !user?.email) {
      setError("Unable to join pack. Please ensure you're logged in.");
      return;
    }

    try {
      setJoiningPack(true);
      setError(null);

      await api.addPackMember(pack.id, user.email);

      // Refresh pack data to show updated member list
      const [packData, membersData] = await Promise.all([
        api.getPackById(pack.id) as Promise<Pack>,
        api.getPackMembers(pack.id) as Promise<PackMember[]>,
      ]);

      setPack(packData);
      setMembers(membersData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to join pack. Please try again."
      );
    } finally {
      setJoiningPack(false);
    }
  };

  const handleRequestPayout = async () => {
    if (
      !userMembership ||
      !pack ||
      !nextInLine ||
      nextInLine.user.id !== user?.id
    ) {
      setError("You are not next in line for payout");
      return;
    }

    try {
      setInitiatingPayout(true);
      setError(null);

      const result = await api.initiatePayout(
        userMembership.id,
        pack.targetAmount
      );

      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate payout. Please try again."
      );
      setInitiatingPayout(false);
    }
  };

  const handleCreatePaymentRequest = async () => {
    if (!pack || !selectedPayerId) {
      setError("Please select a member to request payment from");
      return;
    }

    try {
      setCreatingRequest(true);
      setError(null);

      const result = await api.createPaymentRequest(pack.id, selectedPayerId);
      setPaymentRequest(result.paymentRequest);
      setShowRequestModal(false);
      setSelectedPayerId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create payment request. Please try again."
      );
    } finally {
      setCreatingRequest(false);
    }
  };

  const handleAcceptPaymentRequest = async () => {
    if (!paymentRequest) return;

    try {
      setProcessingRequest(true);
      setError(null);

      const result = await api.acceptPaymentRequest(paymentRequest.id);

      if (result?.payment?.redirectUrl) {
        window.location.href = result.payment.redirectUrl;
      } else {
        // Refresh data
        const [packData, membersData, requestData] = await Promise.all([
          api.getPackById(pack!.id) as Promise<Pack>,
          api.getPackMembers(pack!.id) as Promise<PackMember[]>,
          api.getPaymentRequestByPack(pack!.id).catch(() => ({
            paymentRequest: null,
          })),
        ]);
        setPack(packData);
        setMembers(membersData);
        setPaymentRequest(
          requestData &&
          typeof requestData === "object" &&
          requestData !== null &&
          "paymentRequest" in requestData
            ? (requestData as { paymentRequest: any }).paymentRequest
            : null
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to accept payment request. Please try again."
      );
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectPaymentRequest = async () => {
    if (!paymentRequest) return;

    try {
      setProcessingRequest(true);
      setError(null);

      await api.rejectPaymentRequest(paymentRequest.id);

      // Refresh data
      const [packData, membersData, requestData] = await Promise.all([
        api.getPackById(pack!.id) as Promise<Pack>,
        api.getPackMembers(pack!.id) as Promise<PackMember[]>,
        api.getPaymentRequestByPack(pack!.id).catch(() => ({
          paymentRequest: null,
        })),
      ]);
      setPack(packData);
      setMembers(membersData);
        setPaymentRequest(
          requestData &&
          typeof requestData === "object" &&
          requestData !== null &&
          "paymentRequest" in requestData
            ? (requestData as { paymentRequest: any }).paymentRequest
            : null
        );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject payment request. Please try again."
      );
    } finally {
      setProcessingRequest(false);
    }
  };

  // Get available payers (other members who are not the current user)
  const availablePayers = members.filter((m) => m.user.id !== user?.id);

  // Check if user has pending payment request
  const userPaymentRequest =
    paymentRequest?.status === "PENDING" &&
    paymentRequest?.requestor?.id === user?.id;

  // Check if user has pending payment request to accept/reject
  const pendingRequestForUser =
    paymentRequest?.status === "PENDING" &&
    paymentRequest?.payer?.id === user?.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to={routes.packs}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Packs
          </Link>
          <Link
            to={routes.dashboard}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <PackHeader pack={pack} />

        <div className="border rounded-lg mb-6 p-6">
          <PackStats pack={pack} />
          <ProgressBar pack={pack} />
        </div>

        {nextInLine && <NextInLineAlert nextInLine={nextInLine} />}

        {/* Payment Request Section */}
        {userMembership && !userMembership.hasContributed && (
          <div className="border rounded-lg mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/10">
            <h3 className="text-lg font-semibold mb-4">Payment Request</h3>
            {userPaymentRequest ? (
              <div className="space-y-2">
                <p className="text-sm">
                  You have a pending payment request to{" "}
                  <strong>{paymentRequest.payer.name}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {paymentRequest.status}
                </p>
              </div>
            ) : pendingRequestForUser ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>{paymentRequest.requestor.name}</strong> is requesting
                    you to pay for their contribution (₦
                    {paymentRequest.requestedAmount.toLocaleString()})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You will pay 5% interest in the next round if accepted.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleAcceptPaymentRequest}
                    disabled={processingRequest}
                  >
                    {processingRequest ? "Processing..." : "Accept"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleRejectPaymentRequest}
                    disabled={processingRequest}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm">
                  Request another member to pay for your contribution. You'll pay
                  5% interest in the next round.
                </p>
                {showRequestModal ? (
                  <div className="space-y-4">
                    <select
                      value={selectedPayerId}
                      onChange={(e) => setSelectedPayerId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select a member</option>
                      {availablePayers.map((member) => (
                        <option key={member.id} value={member.user.id}>
                          {member.user.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={handleCreatePaymentRequest}
                        disabled={creatingRequest || !selectedPayerId}
                      >
                        {creatingRequest ? "Creating..." : "Send Request"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowRequestModal(false);
                          setSelectedPayerId("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowRequestModal(true)}
                    disabled={availablePayers.length === 0}
                  >
                    Request Payment
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <MembersQueue members={members} nextInLine={nextInLine} />

        <PaymentHistory payments={payments} />

        {error && (
          <div className="mb-4 border border-destructive rounded-lg p-4 bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          {userMembership ? (
            userMembership.hasContributed ? (
              <span className=" text-sm font-medium">
                🎉 You've paid your dues! All set for this round.
              </span>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {userMembership.owesInterest &&
                  userMembership.interestDueRound === pack.currentRound && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ You owe ₦{userMembership.interestAmount?.toLocaleString()}{" "}
                      interest (5%) from previous round
                    </p>
                  )}
                <Button
                  variant="primary"
                  className="px-6 py-3"
                  onClick={handleMakeContribution}
                  disabled={initiatingPayment}
                >
                  {initiatingPayment
                    ? "Initiating Payment..."
                    : userMembership.owesInterest &&
                      userMembership.interestDueRound === pack.currentRound
                    ? `Pay Contribution + Interest (₦${(
                        pack.contribution +
                        (userMembership.interestAmount || 0)
                      ).toLocaleString()})`
                    : "Make Contribution"}
                </Button>
              </div>
            )
          ) : (
            <Button
              variant="primary"
              className="px-6 py-3"
              onClick={handleJoinPack}
              disabled={joiningPack || !user?.email}
            >
              {joiningPack ? "Joining Pack..." : "Join Pack"}
            </Button>
          )}

          {pack.createdBy === user?.id && (
            <Link to={getRoute.packManage(pack.id)}>
              <Button variant="secondary" className="px-6 py-3">
                Manage Members
              </Button>
            </Link>
          )}

          {nextInLine &&
            nextInLine.user.id === user?.id &&
            pack.currentContributions === pack.targetAmount && (
              <Button
                variant="secondary"
                className="px-6 py-3"
                onClick={handleRequestPayout}
                disabled={initiatingPayout}
              >
                {initiatingPayout ? "Initiating Payout..." : "Request Payout"}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
