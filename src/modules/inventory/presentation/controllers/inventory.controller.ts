import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { BusinessId, CurrentUser } from "src/shared/common/decorators";
import { InventoryService } from "../../application/use-cases/inventory.service";

@Controller("inventory/products")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(
    @Body() dto: Record<string, unknown>,
    @BusinessId() businessId: string,
    @CurrentUser() user: { id?: string } | undefined
  ) {
    return this.inventoryService.createProduct(
      dto,
      businessId,
      user?.id ?? "system"
    );
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: Record<string, unknown>,
    @BusinessId() businessId: string
  ) {
    return this.inventoryService.updateProduct({ ...dto, id }, businessId);
  }

  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string, @BusinessId() businessId: string) {
    return this.inventoryService.deactivateProduct(id, businessId);
  }

  @Get("low-stock")
  listLowStock(@BusinessId() businessId: string) {
    return this.inventoryService.listLowStock(businessId);
  }
}
