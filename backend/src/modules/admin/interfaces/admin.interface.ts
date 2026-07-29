export interface AdminDashboardStats {
  users: {
    total: number;
    farmers: number;
    processors: number;
    distributors: number;
    retailers: number;
    customers: number;
  };
  kyc: {
    pending: number;
    approved: number;
    rejected: number;
  };
  operations: {
    activeOrders: number;
    activeShipments: number;
    totalEscrowLocked: number;
    totalWalletBalance: number;
  };
  support: {
    totalTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
  };
}
