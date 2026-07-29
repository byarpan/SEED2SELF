import { WalletTransactionsRepository, walletTransactionsRepository } from './wallet-transactions.repository.js';
import { TransactionQueryDTO } from './dto/wallet-transactions.dto.js';
import { WalletTransactionItem, TransactionDetailsResponse } from './interfaces/wallet-transactions.interface.js';

export class WalletTransactionsService {
  constructor(private repository: WalletTransactionsRepository = walletTransactionsRepository) {}

  async getTransactionHistory(userId: string, query: TransactionQueryDTO): Promise<WalletTransactionItem[]> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const [dbTxns, orders] = await Promise.all([
      this.repository.findWalletTransactionsForFarmer(user, query.search, query.filter),
      this.repository.findOrdersForFarmer(user, query.search, query.filter),
    ]);

    const items: WalletTransactionItem[] = [];

    // Map WalletTransactions collection records (e.g. Withdrawals, Payouts)
    dbTxns.forEach((txn) => {
      items.push({
        id: txn._id.toString(),
        transactionType: txn.type as any,
        cropName: txn.productName || txn.title,
        buyerName: txn.counterparty,
        amount: txn.rawAmount,
        date: txn.createdAt,
        orderId: txn.orderId || txn.transactionId,
        orderNumber: txn.transactionId,
      });
    });

    // Map Order Escrow/Payment records if not already represented
    orders.forEach((order) => {
      const isCredit = order.escrowStatus === 'RELEASED';
      items.push({
        id: order._id.toString(),
        transactionType: isCredit ? 'BANK_CREDIT' : 'ESCROW_LOCK',
        cropName: order.cropName,
        buyerName: order.buyerName,
        amount: order.totalAmount,
        date: order.createdAt,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      });
    });

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return items;
  }

  async getTransactionDetails(userId: string, id: string): Promise<TransactionDetailsResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    // Try finding in WalletTransactions collection first
    const dbTxn = await this.repository.findTransactionById(id);
    const bankAccount = await this.repository.findBankAccountByUserId(user);

    let maskedAccount = null;
    if (bankAccount && bankAccount.accountNumber) {
      const raw = bankAccount.accountNumber;
      const lastFour = raw.slice(-4);
      maskedAccount = `XXXX-XXXX-${lastFour}`;
    }

    if (dbTxn) {
      return {
        transactionId: dbTxn.transactionId,
        transactionType: dbTxn.type as any,
        status: dbTxn.status as any,
        buyerName: dbTxn.counterparty,
        cropName: dbTxn.productName,
        orderId: dbTxn.orderId || dbTxn.transactionId,
        orderNumber: dbTxn.transactionId,
        amount: dbTxn.rawAmount,
        transactionDate: dbTxn.createdAt,
        transferDetails: {
          transactionId: dbTxn.transactionId,
          utrReference: dbTxn.utr || `UTR-${dbTxn.transactionId}`,
          creditedBankAccount: bankAccount
            ? {
                bankName: bankAccount.bankName,
                accountNumberMasked: maskedAccount || 'XXXX-XXXX-0000',
                accountHolderName: bankAccount.accountHolderName,
                ifscCode: bankAccount.ifscCode,
              }
            : null,
          transferredAmount: dbTxn.rawAmount,
        },
      };
    }

    // Otherwise check Order collection
    const order = await this.repository.findOrderById(id);
    if (!order) {
      throw new Error(`Transaction record '${id}' not found in MongoDB Atlas`);
    }

    const payment = await this.repository.findPaymentByOrderId(order._id);

    const isCredit = order.escrowStatus === 'RELEASED';
    const transactionType = isCredit ? 'BANK_CREDIT' : 'ESCROW_LOCK';
    const status = isCredit ? 'COMPLETED' : 'LOCKED';

    return {
      transactionId: payment ? payment.paymentId : `TXN-${order.orderNumber}`,
      transactionType,
      status,
      buyerName: order.buyerName,
      cropName: order.cropName,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      transactionDate: order.createdAt,
      transferDetails: {
        transactionId: payment ? payment.paymentId : `TXN-${order.orderNumber}`,
        utrReference: payment ? `UTR-${payment.paymentId}` : `UTR-${order.orderNumber}`,
        creditedBankAccount: bankAccount
          ? {
              bankName: bankAccount.bankName,
              accountNumberMasked: maskedAccount || 'XXXX-XXXX-0000',
              accountHolderName: bankAccount.accountHolderName,
              ifscCode: bankAccount.ifscCode,
            }
          : null,
        transferredAmount: order.totalAmount,
      },
    };
  }
}

export const walletTransactionsService = new WalletTransactionsService();
