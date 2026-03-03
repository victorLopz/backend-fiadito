import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, LessThanOrEqual } from 'typeorm';
import { InventoryMovementTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity';
import { ProductTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/product.typeorm-entity';
import { InventoryMovementType } from 'src/shared/infrastructure/persistence/entities/enums';

@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}

  async createProduct(dto: Record<string, unknown>, businessId: string, userId: string): Promise<{ id: string }> {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }

    const sku = this.readString(dto.sku, 'sku');
    const name = this.readString(dto.name, 'name');
    const price = this.readNumber(dto.price, 'price');
    const cost = this.readNumber(dto.cost, 'cost');
    const initialStock = dto.initialStock == null ? 0 : this.readInteger(dto.initialStock, 'initialStock');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepo = queryRunner.manager.getRepository(ProductTypeOrmEntity);
      const movementRepo = queryRunner.manager.getRepository(InventoryMovementTypeOrmEntity);

      const product = await productRepo.save(
        productRepo.create({
          businessId,
          sku,
          name,
          price: this.toMoney(price),
          cost: this.toMoney(cost),
          stock: initialStock,
          allowNegativeStock: dto.allowNegativeStock === true,
          lowStockThreshold: dto.lowStockThreshold == null ? 5 : this.readInteger(dto.lowStockThreshold, 'lowStockThreshold'),
          isActive: true,
        }),
      );

      if (initialStock > 0) {
        await movementRepo.save(
          movementRepo.create({
            businessId,
            productId: product.id,
            movementType: InventoryMovementType.IN,
            quantity: initialStock,
            reason: `INITIAL_STOCK by ${userId || 'system'}`,
            referenceId: product.id,
          }),
        );
      }

      await queryRunner.commitTransaction();
      return { id: product.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(dto: Record<string, unknown>, businessId: string): Promise<void> {
    const id = this.readString(dto.id, 'id');
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }

    const productRepo = this.dataSource.getRepository(ProductTypeOrmEntity);
    const product = await productRepo.findOne({ where: { id, businessId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatePayload: Partial<ProductTypeOrmEntity> = {};

    if (dto.sku != null) {
      updatePayload.sku = this.readString(dto.sku, 'sku');
    }
    if (dto.name != null) {
      updatePayload.name = this.readString(dto.name, 'name');
    }
    if (dto.price != null) {
      updatePayload.price = this.toMoney(this.readNumber(dto.price, 'price'));
    }
    if (dto.cost != null) {
      updatePayload.cost = this.toMoney(this.readNumber(dto.cost, 'cost'));
    }
    if (dto.allowNegativeStock != null) {
      updatePayload.allowNegativeStock = dto.allowNegativeStock === true;
    }
    if (dto.lowStockThreshold != null) {
      updatePayload.lowStockThreshold = this.readInteger(dto.lowStockThreshold, 'lowStockThreshold');
    }

    await productRepo.update({ id, businessId }, updatePayload);
  }

  async deactivateProduct(productId: string, businessId: string): Promise<void> {
    if (!productId || !businessId) {
      throw new BadRequestException('productId and businessId are required');
    }

    const productRepo = this.dataSource.getRepository(ProductTypeOrmEntity);
    const result = await productRepo.update({ id: productId, businessId }, { isActive: false });
    if (!result.affected) {
      throw new NotFoundException('Product not found');
    }
  }

  async listLowStock(businessId: string): Promise<Record<string, unknown>[]> {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }

    const productRepo = this.dataSource.getRepository(ProductTypeOrmEntity);
    const rows = await productRepo.find({
      where: {
        businessId,
        isActive: true,
        stock: LessThanOrEqual(5),
      },
      order: {
        stock: 'ASC',
      },
    });

    return rows
      .filter((row) => row.stock <= row.lowStockThreshold)
      .map((row) => ({
        id: row.id,
        businessId: row.businessId,
        sku: row.sku,
        name: row.name,
        stock: row.stock,
        lowStockThreshold: row.lowStockThreshold,
        price: Number(row.price),
        cost: Number(row.cost),
      }));
  }

  private readString(value: unknown, field: string): string {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    throw new BadRequestException(`${field} is required`);
  }

  private readNumber(value: unknown, field: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${field} must be a number`);
    }
    return parsed;
  }

  private readInteger(value: unknown, field: string): number {
    const parsed = this.readNumber(value, field);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new BadRequestException(`${field} must be an integer >= 0`);
    }
    return parsed;
  }

  private toMoney(amount: number): string {
    return amount.toFixed(2);
  }
}
