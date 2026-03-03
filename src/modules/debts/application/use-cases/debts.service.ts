import { Injectable } from '@nestjs/common';

@Injectable()
export class DebtsService {
  async addPayment(debtId: string, amount: number): Promise<void> {
    // Recompute balance and status OPEN|PARTIAL|PAID after each payment.
    void { debtId, amount };
  }

  async listOpenDebts(filters: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    void filters;
    return [];
  }

  async sendDebtReminder(debtId: string): Promise<void> {
    // Only logs whatsapp reminder entry, no real external send.
    void debtId;
  }
}
