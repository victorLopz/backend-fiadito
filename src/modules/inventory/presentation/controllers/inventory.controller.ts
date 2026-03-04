import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from "@nestjs/common";
import { BusinessId, CurrentUser } from "src/shared/common/decorators";
import { AuthUser } from "src/shared/common/interfaces";
import { CreateProductDto } from "../../application/dto/create-product.dto";
import { UpdateProductDto } from "../../application/dto/update-product.dto";
import { InventoryService } from "../../application/use-cases/inventory.service";

@Controller("inventory/products")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.inventoryService.createProduct(
      dto,
      user.businessId,
      user?.id ?? "system"
    );
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @BusinessId() businessId: string
  ) {
    return this.inventoryService.updateProduct(id, dto, businessId);
  }

  @Patch(":id/deactivate")
  deactivate(
    @Param("id", ParseUUIDPipe) id: string,
    @BusinessId() businessId: string
  ) {
    return this.inventoryService.deactivateProduct(id, businessId);
  }

  @Get("low-stock")
  listLowStock(@BusinessId() businessId: string) {
    return this.inventoryService.listLowStock(businessId);
  }
}
