import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common"
import { BusinessId, CurrentUser } from "src/shared/common/decorators"
import { AuthUser } from "src/shared/common/interfaces"
import { ListOpenDebtsQueryDto } from "../../application/dto/list-open-debts-query.dto"
import { DebtsService } from "../../application/use-cases/debts.service"

@Controller("debts")
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post(":id/payments")
  addPayment(
    @Param("id") debtId: string,
    @Body() body: { amount: number; userId?: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.debtsService.addPayment(debtId, body.amount, body.userId ?? user?.id)
  }

  @Get("open")
  listOpen(@Query() query: ListOpenDebtsQueryDto, @BusinessId() businessId: string) {
    return this.debtsService.listOpenDebts({ ...query, businessId })
  }

  @Post(":id/reminders/whatsapp")
  sendReminder(@Param("id") debtId: string, @CurrentUser() user: AuthUser) {
    return this.debtsService.sendDebtReminder(debtId, user?.id)
  }
}
