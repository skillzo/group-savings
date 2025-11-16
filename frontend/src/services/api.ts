import { PaymentType } from "../types/pack";

const API_BASE_URL = "http://localhost:8000/api/v1";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "API request failed");
  }
  return result.data as T;
}

export const api = {
  // Auth
  getUserByEmail: (email: string) => fetchAPI(`/users/email/${email}`),
  createUser: (userData: {
    email: string;
    name: string;
    accountNumber: string;
    accountName?: string;
    phone?: string;
  }) => {
    return fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to create user"
        );
      }
      return result.data;
    });
  },
  // Packs
  getUserPacks: (userId: string) => fetchAPI(`/packs/user/${userId}`),
  getUserPayments: (userId: string) => fetchAPI(`/payments/user/${userId}`),
  getAllPacks: () => fetchAPI("/packs"),
  getPackById: (packId: string) => fetchAPI(`/packs/${packId}`),
  getPackMembers: (packId: string) => fetchAPI(`/packs/${packId}/members`),
  getPackPayments: (packId: string) => fetchAPI(`/payments/pack/${packId}`),
  addPackMember: (packId: string, email: string) => {
    return fetch(`${API_BASE_URL}/packs/${packId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add member");
      }
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to add member"
        );
      }
      return result.data;
    });
  },
  // Payments
  initiatePayment: (
    memberId: string,
    amount: number,
    type: typeof PaymentType.CONTRIBUTION | typeof PaymentType.PAYOUT
  ) => {
    return fetch(`${API_BASE_URL}/payments/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, amount, type }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate payment");
      }
      const result: ApiResponse<{
        redirectUrl: string;
        transactionId: string;
      }> = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to initiate payment"
        );
      }
      return result.data;
    });
  },
  verifyPayment: (txRef: string) => fetchAPI(`/payments/verify/${txRef}`),
  initiatePayout: (memberId: string, amount: number) => {
    return fetch(`${API_BASE_URL}/payments/initiate-payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, amount }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate payout");
      }
      const result: ApiResponse<{
        redirectUrl: string;
        transactionId: string;
      }> = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to initiate payout"
        );
      }
      return result.data;
    });
  },
  verifyPayout: (txRef: string) => fetchAPI(`/payments/verify-payout/${txRef}`),
};
