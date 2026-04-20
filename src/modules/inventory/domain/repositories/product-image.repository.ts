import { ProductImageTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product-image.typeorm-entity"

export const PRODUCT_IMAGE_REPOSITORY = Symbol("PRODUCT_IMAGE_REPOSITORY")

export interface ProductImageRepository {
  create(input: {
    businessId: string
    productId: string
    imageUrl: string
  }): Promise<ProductImageTypeOrmEntity>
  createMany(
    input: Array<{
      businessId: string
      productId: string
      imageUrl: string
    }>
  ): Promise<ProductImageTypeOrmEntity[]>
  findByProductIds(
    businessId: string,
    productIds: string[]
  ): Promise<ProductImageTypeOrmEntity[]>
  findById(
    id: string,
    businessId: string,
    productId: string
  ): Promise<ProductImageTypeOrmEntity | null>
  deleteByIds(ids: string[]): Promise<void>
  deleteById(id: string, businessId: string, productId: string): Promise<void>
}
