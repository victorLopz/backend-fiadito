import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { BusinessId, CurrentUser } from "src/shared/common/decorators"
import { AuthUser } from "src/shared/common/interfaces"
import { CreateProductDto } from "../../application/dto/create-product.dto"
import { ListLowStockQueryDto } from "../../application/dto/list-low-stock-query.dto"
import { ListProductsQueryDto } from "../../application/dto/list-products-query.dto"
import { UpdateProductDto } from "../../application/dto/update-product.dto"
import { InventoryService, UploadedImageFile } from "../../application/use-cases/inventory.service"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"

@Controller("inventory/products")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.inventoryService.createProduct(dto, user.businessId, user?.id ?? "system")
  }

  @Get()
  list(@BusinessId() businessId: string, @Query() query: ListProductsQueryDto) {
    return this.inventoryService.listProducts(businessId, query)
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @BusinessId() businessId: string
  ) {
    return this.inventoryService.updateProduct(id, dto, businessId)
  }

  @Patch(":id/deactivate")
  deactivate(@Param("id", ParseUUIDPipe) id: string, @BusinessId() businessId: string) {
    return this.inventoryService.deactivateProduct(id, businessId)
  }

  @Get("low-stock")
  listLowStock(@BusinessId() businessId: string, @Query() query: ListLowStockQueryDto) {
    return this.inventoryService.listLowStock(businessId, query)
  }

  @Post(":id/image")
  @UseInterceptors(FilesInterceptor("images", 3))
  uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @BusinessId() businessId: string,
    @UploadedFiles() files?: UploadedImageFile[]
  ) {
    return this.inventoryService.uploadProductImages(id, businessId, files)
  }

  @Delete(":id/image/:imageId")
  deleteImage(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
    @BusinessId() businessId: string
  ) {
    return this.inventoryService.deleteProductImage(id, imageId, businessId)
  }
}
