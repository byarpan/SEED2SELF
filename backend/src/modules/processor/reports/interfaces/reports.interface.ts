export interface ProductMetricResponse {
  name: string;
  quantity: string;
  quantityKg: number;
  revenue: string;
  rawRevenue: number;
  percentage: number;
}

export interface TrendPointResponse {
  period: string;
  revenue: number;
  volume: number;
}

export interface AnalyticsDataResponse {
  produceTransformed: string;
  rawProduceTransformedKg: number;
  totalRevenue: string;
  rawTotalRevenue: number;
  escrowLocked: string;
  rawEscrowLocked: number;
  disputeRate: string;
  rawDisputeRate: number;
  successfulShipments: number;
  totalOrders: number;
  productBreakdown: ProductMetricResponse[];
  trendData: TrendPointResponse[];
  timeframe: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  periodLabel: string;
}
