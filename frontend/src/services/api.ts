import { PaymentType } from "../types/pack";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/user";

const API_BASE_URL = "http://localhost:8000/api/v1";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Unauthorized - clear auth and redirect to login
    useAuthStore.getState().logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.error || `API error: ${response.statusText}`,
    );
  }

  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "API request failed");
  }
  return result.data as T;
}

export const api = {
  // Auth
  login: async (phone: string) => {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }
      const result: ApiResponse<{ token: string; user: User }> =
        await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || result.error || "Failed to login");
      }
      return result.data;
    });
  },
  signup: async (userData: {
    email: string;
    name: string;
    accountNumber: string;
    accountName: string;
    phone: string;
    password: string;
  }) => {
    return fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to signup");
      }
      const result: ApiResponse<{ token: string; user: User }> =
        await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || result.error || "Failed to signup");
      }
      return result.data;
    });
  },
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
          result.message || result.error || "Failed to create user",
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
          result.message || result.error || "Failed to add member",
        );
      }
      return result.data;
    });
  },
  // Payments
  initiatePayment: (
    memberId: string,
    amount: number,
    type: typeof PaymentType.CONTRIBUTION | typeof PaymentType.PAYOUT,
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
          result.message || result.error || "Failed to initiate payment",
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
          result.message || result.error || "Failed to initiate payout",
        );
      }
      return result.data;
    });
  },
  verifyPayout: (txRef: string) => fetchAPI(`/payments/verify-payout/${txRef}`),
  // Payment Requests
  createPaymentRequest: (packId: string, payerId: string) => {
    return fetch(`${API_BASE_URL}/payment-requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ packId, payerId }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create payment request");
      }
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to create payment request",
        );
      }
      return result.data;
    });
  },
  acceptPaymentRequest: (requestId: string) => {
    return fetch(`${API_BASE_URL}/payment-requests/${requestId}/accept`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to accept payment request");
      }
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to accept payment request",
        );
      }
      return result.data;
    });
  },
  rejectPaymentRequest: (requestId: string) => {
    return fetch(`${API_BASE_URL}/payment-requests/${requestId}/reject`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject payment request");
      }
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(
          result.message || result.error || "Failed to reject payment request",
        );
      }
      return result.data;
    });
  },
  getPaymentRequestByPack: (packId: string) =>
    fetchAPI(`/payment-requests/pack/${packId}`),
  getPendingPaymentRequests: () => fetchAPI("/payment-requests/pending"),
};
