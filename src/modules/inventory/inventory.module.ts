import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "../auth/auth.module"
import { InventoryAdjustmentService } from "./application/use-cases/inventory-adjustment.service"
import { KardexHistoryService } from "./application/use-cases/kardex-history.service"
import { StockEntryService } from "./application/use-cases/stock-entry.service"
import { INVENTORY_ITEM_REPOSITORY } from "./domain/repositories/inventory-item.repository"
import { INVENTORY_MOVEMENT_REPOSITORY } from "./domain/repositories/inventory-movement.repository"
import { TypeOrmInventoryItemRepository } from "./infrastructure/repositories/typeorm-inventory-item.repository"
import { TypeOrmInventoryMovementRepository } from "./infrastructure/repositories/typeorm-inventory-movement.repository"
import { InventoryController } from "./presentation/controllers/inventory.controller"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ProductTypeOrmEntity, InventoryMovementTypeOrmEntity])],
  controllers: [InventoryController],
  providers: [
    StockEntryService,
    InventoryAdjustmentService,
    KardexHistoryService,
    TypeOrmInventoryItemRepository,
    TypeOrmInventoryMovementRepository,
    { provide: INVENTORY_ITEM_REPOSITORY, useExisting: TypeOrmInventoryItemRepository },
    { provide: INVENTORY_MOVEMENT_REPOSITORY, useExisting: TypeOrmInventoryMovementRepository }
  ]
})
export class InventoryModule {}
