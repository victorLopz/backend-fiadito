import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import {
  INVENTORY_MOVEMENT_REPOSITORY,
  InventoryMovementRepository
} from "src/modules/inventory/domain/repositories/inventory-movement.repository";
import {
  PRODUCT_REPOSITORY,
  ProductRepository
} from "src/modules/inventory/domain/repositories/product.repository";
import { InventoryMovementType } from "src/shared/infrastructure/persistence/entities/enums";
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity";

@Injectable()
export class InventoryService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(INVENTORY_MOVEMENT_REPOSITORY)
    private readonly inventoryMovementRepository: InventoryMovementRepository
  ) {}

  async createProduct(
    dto: CreateProductDto,
    businessId: string,
    userId: string
  ): Promise<{ id: string }> {
    if (!businessId) {
      throw new BadRequestException("businessId is required");
    }

    const initialStock = dto.initialStock ?? 0;

    const product = await this.productRepository.create({
      businessId,
      sku: dto.sku,
      name: dto.name,
      barcode: dto.barcode,
      price: this.toMoney(dto.price),
      cost: this.toMoney(dto.cost),
      stockCurrent: initialStock,
      stockMin: dto.stockMin ?? 0,
      createdBy: userId || "system"
    });

    if (initialStock > 0) {
      await this.inventoryMovementRepository.create({
        businessId,
        productId: product.id,
        type: InventoryMovementType.IN,
        quantity: initialStock,
        reason: `INITIAL_STOCK by ${userId || "system"}`,
        createdBy: userId || "system"
      });
    }

    return { id: product.id };
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    businessId: string
  ): Promise<void> {
    if (!businessId) {
      throw new BadRequestException("businessId is required");
    }

    const product = await this.productRepository.findById(id, businessId);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const updatePayload: Partial<ProductTypeOrmEntity> = {};

    if (dto.sku !== undefined) {
      updatePayload.sku = dto.sku;
    }
    if (dto.name !== undefined) {
      updatePayload.name = dto.name;
    }
    if (dto.barcode !== undefined) {
      updatePayload.barcode = dto.barcode;
    }
    if (dto.price !== undefined) {
      updatePayload.price = this.toMoney(dto.price);
    }
    if (dto.cost !== undefined) {
      updatePayload.cost = this.toMoney(dto.cost);
    }
    if (dto.stockMin !== undefined) {
      updatePayload.stockMin = dto.stockMin;
    }

    await this.productRepository.update(id, businessId, updatePayload);
  }

  async deactivateProduct(
    productId: string,
    businessId: string
  ): Promise<void> {
    if (!productId || !businessId) {
      throw new BadRequestException("productId and businessId are required");
    }

    const deactivated = await this.productRepository.deactivate(
      productId,
      businessId
    );
    if (!deactivated) {
      throw new NotFoundException("Product not found");
    }
  }

  async listLowStock(businessId: string): Promise<Record<string, unknown>[]> {
    if (!businessId) {
      throw new BadRequestException("businessId is required");
    }

    const rows =
      await this.productRepository.findLowStockCandidates(businessId);

    return rows
      .filter((row) => row.stockCurrent <= row.stockMin)
      .map((row) => ({
        id: row.id,
        businessId: row.businessId,
        sku: row.sku,
        name: row.name,
        barcode: row.barcode,
        stockCurrent: row.stockCurrent,
        stockMin: row.stockMin,
        price: Number(row.price),
        cost: Number(row.cost)
      }));
  }

  private toMoney(amount: number): string {
    return amount.toFixed(2);
  }
}
