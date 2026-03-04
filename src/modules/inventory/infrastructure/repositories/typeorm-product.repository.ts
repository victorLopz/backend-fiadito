import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductRepository } from "src/modules/inventory/domain/repositories/product.repository";
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity";

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductTypeOrmEntity)
    private readonly repository: Repository<ProductTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string;
    sku: string;
    name: string;
    barcode?: string;
    price: string;
    cost: string;
    stockCurrent: number;
    stockMin?: number;
    createdBy: string;
  }): Promise<ProductTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        sku: input.sku,
        name: input.name,
        barcode: input.barcode,
        price: input.price,
        cost: input.cost,
        stockCurrent: input.stockCurrent,
        stockMin: input.stockMin ?? 0,
        createdBy: input.createdBy,
        isActive: true
      })
    );
  }

  async findById(
    id: string,
    businessId: string
  ): Promise<ProductTypeOrmEntity | null> {
    return this.repository.findOne({ where: { id, businessId } });
  }

  async update(
    id: string,
    businessId: string,
    input: Partial<ProductTypeOrmEntity>
  ): Promise<void> {
    await this.repository.update({ id, businessId }, input);
  }

  async deactivate(id: string, businessId: string): Promise<boolean> {
    const result = await this.repository.update(
      { id, businessId },
      { isActive: false }
    );
    return !!result.affected;
  }

  async findLowStockCandidates(
    businessId: string
  ): Promise<ProductTypeOrmEntity[]> {
    return this.repository.find({
      where: {
        businessId,
        isActive: true
      },
      order: {
        stockCurrent: "ASC"
      }
    });
  }
}
