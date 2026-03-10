import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "src/modules/auth/auth.module"
import { InventoryModule } from "src/modules/inventory/inventory.module"
import { CreateSaleUseCase } from "src/modules/sales/application/use-cases/create-sale.use-case"
import { ListSalesUseCase } from "src/modules/sales/application/use-cases/list-sales.use-case"
import { SALE_REPOSITORY } from "src/modules/sales/domain/repositories/sale.repository"
import { VoucherImgAdapter } from "src/modules/sales/infrastructure/adapters/voucher-img.adapter"
import { SaleMapper } from "src/modules/sales/infrastructure/persistence/mappers/sale.mapper"
import { TypeOrmSaleRepository } from "src/modules/sales/infrastructure/persistence/repositories/typeorm-sale.repository"
import { SalesController } from "src/modules/sales/presentation/controllers/sales.controller"
import { SaleItemTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale-item.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"
import { FindOneSaleUseCase } from "./application/use-cases/find-one-sales.use-case"

@Module({
  imports: [
    AuthModule,
    InventoryModule,
    TypeOrmModule.forFeature([
      SaleTypeOrmEntity,
      SaleItemTypeOrmEntity,
      CustomerTypeOrmEntity,
      ProductTypeOrmEntity
    ])
  ],
  controllers: [SalesController],
  providers: [
    CreateSaleUseCase,
    ListSalesUseCase,
    FindOneSaleUseCase,
    VoucherImgAdapter,
    SaleMapper,
    TypeOrmSaleRepository,
    { provide: SALE_REPOSITORY, useExisting: TypeOrmSaleRepository }
  ],
  exports: [CreateSaleUseCase, ListSalesUseCase, FindOneSaleUseCase]
})
export class SalesModule {}
