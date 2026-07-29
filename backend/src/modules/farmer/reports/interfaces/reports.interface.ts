export interface CropMetricResponse {
  name: string;
  quantity: string;
  numericQuantity: number;
  revenue: string;
  numericRevenue: number;
  percentage: number;
}

export interface TrendPointResponse {
  period: string;
  revenue: number;
  volume: number;
}

export interface AnalyticsSummaryResponse {
  timeframe: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  produceSold: string;
  numericProduceSold: number;
  totalRevenue: string;
  numericTotalRevenue: number;
  escrowLocked: string;
  numericEscrowLocked: number;
  disputeRate: string;
  numericDisputeRate: number;
  successfulShipments: number;
  totalOrders: number;
  cropBreakdown: CropMetricResponse[];
  trendData: TrendPointResponse[];
  generatedAt: Date;
}

export interface ReportExportResponse {
  fileName: string;
  contentType: string;
  content: string; // CSV string or Base64 PDF content
}
