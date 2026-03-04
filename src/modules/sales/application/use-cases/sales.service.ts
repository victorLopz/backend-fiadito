import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Between, In } from 'typeorm';
import { DebtTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/debt.typeorm-entity';
import { InventoryMovementTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity';
import { ProductTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/product.typeorm-entity';
import { SaleItemTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/sale-item.typeorm-entity';
import { SaleTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/sale.typeorm-entity';
import { VoucherTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/voucher.typeorm-entity';
import { DebtStatus, InventoryMovementType, SaleType } from 'src/shared/infrastructure/persistence/entities/enums';

type SaleItemInput = {
  productId: string;
  quantity: number;
  unitPrice?: number;
};

type CreateSaleInput = {
  businessId: string;
  userId: string;
  clientId?: string;
  type: SaleType;
  discountTotal?: number;
  items: SaleItemInput[];
};

@Injectable()
export class SalesService {
  constructor(private readonly dataSource: DataSource) {}

  async createSale(dto: Record<string, unknown>): Promise<{ saleId: string }> {
    const input = this.parseCreateSaleInput(dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepo = queryRunner.manager.getRepository(ProductTypeOrmEntity);
      const saleRepo = queryRunner.manager.getRepository(SaleTypeOrmEntity);
      const saleItemRepo = queryRunner.manager.getRepository(SaleItemTypeOrmEntity);
      const movementRepo = queryRunner.manager.getRepository(InventoryMovementTypeOrmEntity);
      const debtRepo = queryRunner.manager.getRepository(DebtTypeOrmEntity);
      const voucherRepo = queryRunner.manager.getRepository(VoucherTypeOrmEntity);

      const productIds = [...new Set(input.items.map((item) => item.productId))];
      const products = await productRepo.find({
        where: {
          businessId: input.businessId,
          id: In(productIds),
          isActive: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('Some products were not found or are inactive');
      }

      const byId = new Map(products.map((p) => [p.id, p]));
      let subtotal = 0;

      const saleItemsToCreate: Array<{
        businessId: string;
        saleId: string;
        productId: string;
        quantity: number;
        unitPrice: string;
        unitCost: string;
        lineTotal: string;
      }> = [];

      const movementsToCreate: Array<{
        businessId: string;
        productId: string;
        movementType: InventoryMovementType;
        quantity: number;
        reason: string;
      }> = [];

      for (const item of input.items) {
        const product = byId.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new BadRequestException('Item quantity must be an integer > 0');
        }

        if (product.stockCurrent < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.id}`);
        }

        const unitPrice = item.unitPrice ?? Number(product.price);
        const unitCost = Number(product.cost);
        const lineTotal = unitPrice * item.quantity;

        subtotal += lineTotal;
        product.stockCurrent -= item.quantity;

        saleItemsToCreate.push({
          businessId: input.businessId,
          saleId: '',
          productId: product.id,
          quantity: item.quantity,
          unitPrice: this.toMoney(unitPrice),
          unitCost: this.toMoney(unitCost),
          lineTotal: this.toMoney(lineTotal),
        });

        movementsToCreate.push({
          businessId: input.businessId,
          productId: product.id,
          movementType: InventoryMovementType.OUT,
          quantity: item.quantity,
          reason: 'SALE',
        });
      }

      const discountTotal = Math.max(0, input.discountTotal ?? 0);
      if (discountTotal > subtotal) {
        throw new BadRequestException('discountTotal cannot be greater than subtotal');
      }

      const total = subtotal - discountTotal;

      const sale = await saleRepo.save(
        saleRepo.create({
          businessId: input.businessId,
          userId: input.userId,
          clientId: input.clientId,
          type: input.type,
          subtotal: this.toMoney(subtotal),
          discountTotal: this.toMoney(discountTotal),
          total: this.toMoney(total),
        }),
      );

      await saleItemRepo.save(
        saleItemsToCreate.map((item) =>
          saleItemRepo.create({
            ...item,
            saleId: sale.id,
          }),
        ),
      );

      await movementRepo.save(
        movementsToCreate.map((movement) =>
          movementRepo.create({
            ...movement,
            // referenceId: sale.id,
          }),
        ),
      );

      await Promise.all(products.map((product) => productRepo.update({ id: product.id }, { stockCurrent: product.stockCurrent })));

      if (input.type === SaleType.CREDIT) {
        if (!input.clientId) {
          throw new BadRequestException('clientId is required for credit sales');
        }

        await debtRepo.save(
          debtRepo.create({
            businessId: input.businessId,
            saleId: sale.id,
            clientId: input.clientId,
            totalAmount: this.toMoney(total),
            paidAmount: this.toMoney(0),
            balance: this.toMoney(total),
            status: DebtStatus.OPEN,
          }),
        );
      }

      await voucherRepo.save(
        voucherRepo.create({
          businessId: input.businessId,
          saleId: sale.id,
          imageUrl: `pending://voucher/${sale.id}`,
        }),
      );

      await queryRunner.commitTransaction();
      return { saleId: sale.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listSales(filters: { businessId: string; from: Date; to: Date }): Promise<Record<string, unknown>[]> {
    if (!filters.businessId) {
      throw new BadRequestException('businessId is required');
    }

    if (Number.isNaN(filters.from.getTime()) || Number.isNaN(filters.to.getTime())) {
      throw new BadRequestException('from and to must be valid dates');
    }

    const saleRepo = this.dataSource.getRepository(SaleTypeOrmEntity);
    const rows = await saleRepo.find({
      where: {
        businessId: filters.businessId,
        createdAt: Between(filters.from, filters.to),
      },
      order: { createdAt: 'DESC' },
    });

    return rows.map((sale) => ({
      id: sale.id,
      businessId: sale.businessId,
      userId: sale.userId,
      clientId: sale.clientId,
      type: sale.type,
      subtotal: Number(sale.subtotal),
      discountTotal: Number(sale.discountTotal),
      total: Number(sale.total),
      createdAt: sale.createdAt,
    }));
  }

  private parseCreateSaleInput(dto: Record<string, unknown>): CreateSaleInput {
    const businessId = this.readString(dto.businessId, 'businessId');
    const userId = this.readString(dto.userId, 'userId');

    const rawType = this.readString(dto.type ?? SaleType.CASH, 'type').toUpperCase();
    if (!Object.values(SaleType).includes(rawType as SaleType)) {
      throw new BadRequestException('type must be CASH or CREDIT');
    }

    const rawItems = dto.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    const items: SaleItemInput[] = rawItems.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`items[${index}] must be an object`);
      }

      const asRecord = item as Record<string, unknown>;
      return {
        productId: this.readString(asRecord.productId, `items[${index}].productId`),
        quantity: this.readNumber(asRecord.quantity, `items[${index}].quantity`),
        unitPrice: asRecord.unitPrice == null ? undefined : this.readNumber(asRecord.unitPrice, `items[${index}].unitPrice`),
      };
    });

    return {
      businessId,
      userId,
      clientId: dto.clientId ? this.readString(dto.clientId, 'clientId') : undefined,
      type: rawType as SaleType,
      discountTotal: dto.discountTotal == null ? undefined : this.readNumber(dto.discountTotal, 'discountTotal'),
      items,
    };
  }

  private readString(value: unknown, field: string): string {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    throw new BadRequestException(`${field} is required`);
  }

  private readNumber(value: unknown, field: string): number {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new BadRequestException(`${field} must be a valid number`);
    }
    return num;
  }

  private toMoney(amount: number): string {
    return amount.toFixed(2);
  }
}
