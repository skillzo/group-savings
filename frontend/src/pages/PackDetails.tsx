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
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [packData, membersData, paymentsData] = await Promise.all([
          api.getPackById(id) as Promise<Pack>,
          api.getPackMembers(id) as Promise<PackMember[]>,
          api.getPackPayments(id) as Promise<Payment[]>,
        ]);

        setPack(packData);
        setMembers(membersData);
        setPayments(paymentsData);
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
              <Button
                variant="primary"
                className="px-6 py-3"
                onClick={handleMakeContribution}
                disabled={initiatingPayment}
              >
                {initiatingPayment
                  ? "Initiating Payment..."
                  : "Make Contribution"}
              </Button>
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
