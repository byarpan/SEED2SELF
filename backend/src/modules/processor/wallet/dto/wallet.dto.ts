export interface UpdateBankAccountDTO {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchLocation: string;
}

export interface AddEscrowItemDTO {
  cropName: string;
  cropImage?: string;
  batchNumber: string;
  quantity: string;
  supplier: string;
  escrowAmount: string;
  rawAmount: number;
  orderStatus: string;
  orderId: string;
  escrowType?: 'DISTRIBUTOR_PURCHASE' | 'FARMER_RAW_MATERIAL';
}

export interface AddTransactionDTO {
  title: string;
  productName: string;
  counterparty: string;
  counterpartyRole?: 'Farmer' | 'Distributor' | 'Processor' | 'Admin';
  counterpartyUpi?: string;
  orderId?: string;
  amount: string;
  rawAmount: number;
  type?: 'ESCROW' | 'DISTRIBUTOR' | 'FARMER_PAYMENT' | 'PAYOUT';
  status?: string;
  bankName?: string;
  utr?: string;
  timeframe?: 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
}

export interface QueryWalletDTO {
  timeframe?: 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
}
