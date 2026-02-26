import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DebtsService } from '../../application/use-cases/debts.service';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post(':id/payments')
  addPayment(@Param('id') debtId: string, @Body() body: { amount: number }) {
    return this.debtsService.addPayment(debtId, body.amount);
  }

  @Get('open')
  listOpen(@Query() query: Record<string, unknown>) {
    return this.debtsService.listOpenDebts(query);
  }

  @Post(':id/reminders/whatsapp')
  sendReminder(@Param('id') debtId: string) {
    return this.debtsService.sendDebtReminder(debtId);
  }
}
