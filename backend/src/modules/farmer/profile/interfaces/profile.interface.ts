import { IUser } from '../../../../shared/models/User.js';
import { IAddress } from '../../../../shared/models/Address.js';
import { IKYC } from '../../../../shared/models/KYC.js';
import { IBankAccount } from '../../../../shared/models/BankAccount.js';

export interface FarmerFullProfileResponse {
  user: Partial<IUser>;
  address: Partial<IAddress> | null;
  kyc: Partial<IKYC> | null;
  bankAccount?: Partial<IBankAccount> | null;
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderAlerts: boolean;
    paymentAlerts: boolean;
  };
}
