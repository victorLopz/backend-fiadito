import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity";

export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

export interface ProductRepository {
  create(input: {
    businessId: string;
    sku: string;
    name: string;
    barcode?: string;
    price: string;
    cost: string;
    stockCurrent: number;
    stockMin?: number;
    createdBy: string;
  }): Promise<ProductTypeOrmEntity>;
  findById(
    id: string,
    businessId: string
  ): Promise<ProductTypeOrmEntity | null>;
  update(
    id: string,
    businessId: string,
    input: Partial<ProductTypeOrmEntity>
  ): Promise<void>;
  deactivate(id: string, businessId: string): Promise<boolean>;
  findLowStockCandidates(businessId: string): Promise<ProductTypeOrmEntity[]>;
}
