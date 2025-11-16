export interface Pack {
  id: string;
  name: string;
  contribution: number;
  targetAmount: number;
  totalMembers: number;
  currentRound: number;
  currentContributions: number;
  totalContributions: number;
  status: "ACTIVE" | "COMPLETED" | "INACTIVE";
  createdAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    name: string;
  };
}

export interface PackMember {
  id: string;
  order: number;
  hasReceived: boolean;
  hasContributed: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  type: "CONTRIBUTION" | "PAYOUT";
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export const PaymentType = {
  CONTRIBUTION: "CONTRIBUTION",
  PAYOUT: "PAYOUT",
};
