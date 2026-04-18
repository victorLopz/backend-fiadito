import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ProductImageRepository } from "src/modules/inventory/domain/repositories/product-image.repository"
import { ProductImageTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product-image.typeorm-entity"
import { In, Repository } from "typeorm"

@Injectable()
export class TypeOrmProductImageRepository implements ProductImageRepository {
  constructor(
    @InjectRepository(ProductImageTypeOrmEntity)
    private readonly repository: Repository<ProductImageTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    productId: string
    imageUrl: string
  }): Promise<ProductImageTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        businessId: input.businessId,
        productId: input.productId,
        imageUrl: input.imageUrl
      })
    )
  }

  async createMany(
    input: Array<{
      businessId: string
      productId: string
      imageUrl: string
    }>
  ): Promise<ProductImageTypeOrmEntity[]> {
    if (input.length === 0) {
      return []
    }

    return this.repository.save(
      input.map((item) =>
        this.repository.create({
          businessId: item.businessId,
          productId: item.productId,
          imageUrl: item.imageUrl
        })
      )
    )
  }

  async findByProductIds(
    businessId: string,
    productIds: string[]
  ): Promise<ProductImageTypeOrmEntity[]> {
    if (productIds.length === 0) {
      return []
    }

    return this.repository.find({
      where: { businessId, productId: In(productIds) },
      order: { createdAt: "ASC" }
    })
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return
    }

    await this.repository.delete(ids)
  }
}
