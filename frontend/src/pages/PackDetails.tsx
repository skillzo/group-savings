import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Loader } from "../components/Loader";
import type { Pack, PackMember, Payment } from "../types/pack";
import { PackHeader } from "../components/pack/PackHeader";
import { PackStats } from "../components/pack/PackStats";
import { ProgressBar } from "../components/pack/ProgressBar";
import { NextInLineAlert } from "../components/pack/NextInLineAlert";
import { MembersQueue } from "../components/pack/MembersQueue";
import { PaymentHistory } from "../components/pack/PaymentHistory";
import { PackActionButtons } from "../components/pack/PackActionButtons";

export default function PackDetails() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<Pack | null>(null);
  const [members, setMembers] = useState<PackMember[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Link
            to="/packs"
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            ← Back to Packs
          </Link>
          <Link
            to="/"
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

        <PackActionButtons pack={pack} />
      </div>
    </div>
  );
}
