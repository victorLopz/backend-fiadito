import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common"
import { BusinessId, CurrentUser } from "src/shared/common/decorators"
import { AuthUser } from "src/shared/common/interfaces"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { InventoryAdjustmentRequestDto } from "../../application/dto/inventory-adjustment-request.dto"
import { KardexQueryDto } from "../../application/dto/kardex-query.dto"
import { StockEntryRequestDto } from "../../application/dto/stock-entry-request.dto"
import { InventoryAdjustmentService } from "../../application/use-cases/inventory-adjustment.service"
import { KardexHistoryService } from "../../application/use-cases/kardex-history.service"
import { StockEntryService } from "../../application/use-cases/stock-entry.service"

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly stockEntryService: StockEntryService,
    private readonly inventoryAdjustmentService: InventoryAdjustmentService,
    private readonly kardexHistoryService: KardexHistoryService
  ) {}

  @Post("stock-entry")
  stockEntry(
    @Body() dto: StockEntryRequestDto,
    @BusinessId() businessId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.stockEntryService.execute(businessId, {
      productId: dto.productId,
      quantity: dto.quantity,
      reason: dto.reason,
      createdBy: user.id ?? "system"
    })
  }

  @Post("adjustment")
  adjustment(
    @Body() dto: InventoryAdjustmentRequestDto,
    @BusinessId() businessId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.inventoryAdjustmentService.execute(businessId, {
      productId: dto.productId,
      quantity: dto.quantity,
      reason: dto.reason,
      createdBy: user.id ?? "system"
    })
  }

  @Get("kardex")
  kardex(@BusinessId() businessId: string, @Query() query: KardexQueryDto) {
    return this.kardexHistoryService.execute(businessId, query)
  }
}
