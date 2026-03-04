import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InventoryService } from './application/use-cases/inventory.service';
import { INVENTORY_MOVEMENT_REPOSITORY } from './domain/repositories/inventory-movement.repository';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { TypeOrmInventoryMovementRepository } from './infrastructure/repositories/typeorm-inventory-movement.repository';
import { TypeOrmProductRepository } from './infrastructure/repositories/typeorm-product.repository';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { InventoryMovementTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity';
import { ProductTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/product.typeorm-entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ProductTypeOrmEntity, InventoryMovementTypeOrmEntity])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    TypeOrmProductRepository,
    TypeOrmInventoryMovementRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: TypeOrmProductRepository },
    { provide: INVENTORY_MOVEMENT_REPOSITORY, useExisting: TypeOrmInventoryMovementRepository },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
