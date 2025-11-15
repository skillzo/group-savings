const API_BASE_URL = 'http://localhost:8000/api/v1';

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
    throw new Error(result.message || result.error || 'API request failed');
  }
  return result.data as T;
}

export const api = {
  getUserPacks: (userId: string) => fetchAPI(`/packs/user/${userId}`),
  getUserPayments: (userId: string) => fetchAPI(`/payments/user/${userId}`),
  getPackMembers: (packId: string) => fetchAPI(`/packs/${packId}/members`),
};

