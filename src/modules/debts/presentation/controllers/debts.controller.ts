import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '../../../../shared/common/swagger/swagger';
import { BusinessId, CurrentUser } from 'src/shared/common/decorators';
import { AuthUser } from 'src/shared/common/interfaces';
import { AddDebtPaymentDto, ListOpenDebtsQueryDto } from '../../application/dto/debts.dto';
import { DebtsService } from '../../application/use-cases/debts.service';

@ApiTags('Debts')
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post(':id/payments')
  @ApiOperation({ summary: 'Registrar pago de una deuda' })
  @ApiParam({ name: 'id', description: 'ID de la deuda', example: 'd905d7e1-87bb-45e5-a0c0-04cfd58a0bf2' })
  @ApiBody({ type: AddDebtPaymentDto })
  @ApiResponse({ status: 201, description: 'Pago registrado correctamente.' })
  addPayment(
    @Param('id', ParseUUIDPipe) debtId: string,
    @Body() body: AddDebtPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.debtsService.addPayment(debtId, body.amount, body.userId ?? user?.id);
  }

  @Get('open')
  @ApiOperation({ summary: 'Listar deudas abiertas/parciales' })
  @ApiResponse({ status: 200, description: 'Listado de deudas abiertas.' })
  listOpen(@Query() query: ListOpenDebtsQueryDto, @BusinessId() businessId: string) {
    return this.debtsService.listOpenDebts({ ...query, businessId: query.businessId ?? businessId });
  }

  @Post(':id/reminders/whatsapp')
  @ApiOperation({ summary: 'Generar recordatorio WhatsApp de deuda' })
  @ApiParam({ name: 'id', description: 'ID de la deuda', example: 'd905d7e1-87bb-45e5-a0c0-04cfd58a0bf2' })
  @ApiResponse({ status: 201, description: 'Recordatorio encolado.' })
  sendReminder(@Param('id', ParseUUIDPipe) debtId: string) {
    return this.debtsService.sendDebtReminder(debtId);
  }
}
