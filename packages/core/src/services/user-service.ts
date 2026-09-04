import { BaseService } from './base-service';
import type { UserProfile, UserBalance, CashTransaction } from '../types/user';

export class UserService extends BaseService {
  async getProfile(): Promise<UserProfile> {
    const res = await this.get<{ data: UserProfile }>('/profile');
    return res.data;
  }

  async getBalance(): Promise<UserBalance> {
    // Note: /user/balance responds with { balance: ... } envelope
    const res = await this.get<{ balance: UserBalance }>('/user/balance');
    return res.balance;
  }

  async getTransactions(): Promise<CashTransaction[]> {
    const res = await this.get<{ data: CashTransaction[] }>('/user-balance/cash-transaction');
    return res.data;
  }
}
