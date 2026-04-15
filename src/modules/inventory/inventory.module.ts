import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "../auth/auth.module"
import { InventoryService } from "./application/use-cases/inventory.service"
import { INVENTORY_MOVEMENT_REPOSITORY } from "./domain/repositories/inventory-movement.repository"
import { PRODUCT_IMAGE_REPOSITORY } from "./domain/repositories/product-image.repository"
import { PRODUCT_REPOSITORY } from "./domain/repositories/product.repository"
import { TypeOrmInventoryMovementRepository } from "./infrastructure/repositories/typeorm-inventory-movement.repository"
import { TypeOrmProductImageRepository } from "./infrastructure/repositories/typeorm-product-image.repository"
import { TypeOrmProductRepository } from "./infrastructure/repositories/typeorm-product.repository"
import { InventoryController } from "./presentation/controllers/inventory.controller"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"
import { ProductImageTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product-image.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"
import { ProductImageStorageAdapter } from "./infrastructure/adapters/product-image-storage.adapter"

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ProductTypeOrmEntity,
      ProductImageTypeOrmEntity,
      InventoryMovementTypeOrmEntity
    ])
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    ProductImageStorageAdapter,
    TypeOrmProductRepository,
    TypeOrmProductImageRepository,
    TypeOrmInventoryMovementRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: TypeOrmProductRepository },
    { provide: PRODUCT_IMAGE_REPOSITORY, useExisting: TypeOrmProductImageRepository },
    { provide: INVENTORY_MOVEMENT_REPOSITORY, useExisting: TypeOrmInventoryMovementRepository }
  ],
  exports: [InventoryService]
})
export class InventoryModule {}
