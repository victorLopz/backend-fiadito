import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '../../../../shared/common/swagger/swagger';
import { BusinessId, CurrentUser } from 'src/shared/common/decorators';
import { AuthUser } from 'src/shared/common/interfaces';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt-auth.guard';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { ListLowStockQueryDto } from '../../application/dto/list-low-stock-query.dto';
import { ListProductsQueryDto } from '../../application/dto/list-products-query.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { InventoryService } from '../../application/use-cases/inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory/products')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear producto de inventario' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Producto creado correctamente.' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.inventoryService.createProduct(dto, user.businessId, user?.id ?? 'system');
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos paginados' })
  @ApiResponse({ status: 200, description: 'Listado de productos.' })
  list(@BusinessId() businessId: string, @Query() query: ListProductsQueryDto) {
    return this.inventoryService.listProducts(businessId, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 'b5fe9f69-c766-4b9d-8ebf-a142f3d1db53' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto, @BusinessId() businessId: string) {
    return this.inventoryService.updateProduct(id, dto, businessId);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 'b5fe9f69-c766-4b9d-8ebf-a142f3d1db53' })
  @ApiResponse({ status: 200, description: 'Producto desactivado.' })
  deactivate(@Param('id', ParseUUIDPipe) id: string, @BusinessId() businessId: string) {
    return this.inventoryService.deactivateProduct(id, businessId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Listar productos con bajo stock' })
  @ApiResponse({ status: 200, description: 'Listado de productos con stock bajo.' })
  listLowStock(@BusinessId() businessId: string, @Query() query: ListLowStockQueryDto) {
    return this.inventoryService.listLowStock(businessId, query);
  }
}
