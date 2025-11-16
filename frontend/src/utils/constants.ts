export const routes = {
  dashboard: "/",
  packs: "/packs",
  packDetails: "/packs/:id",
  packCreate: "/packs/create",
  packManage: "/packs/:packId/manage",

  payouts: "/payouts",

  login: "/login",
  register: "/register",
  paymentStatus: "/payment-status",
};

// Helper function to generate dynamic routes
export const getRoute = {
  packDetails: (id: string) => `/packs/${id}`,
  packManage: (packId: string) => `/packs/${packId}/manage`,
  paymentStatus: (packId?: string) =>
    packId ? `/payment-status?packId=${packId}` : "/payment-status",
};
