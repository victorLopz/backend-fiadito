import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { CreateProductDto } from "../dto/create-product.dto"
import { ListLowStockQueryDto } from "../dto/list-low-stock-query.dto"
import { ListProductsQueryDto } from "../dto/list-products-query.dto"
import { UpdateProductDto } from "../dto/update-product.dto"
import {
  INVENTORY_MOVEMENT_REPOSITORY,
  InventoryMovementRepository
} from "src/modules/inventory/domain/repositories/inventory-movement.repository"
import {
  PRODUCT_REPOSITORY,
  ProductRepository
} from "src/modules/inventory/domain/repositories/product.repository"
import { InventoryMovementType } from "src/shared/infrastructure/persistence/entities/enums"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"
import { EntityManager } from "typeorm"

export interface SaleInventoryProductSnapshot {
  id: string
  price: number
  cost: number
  stockCurrent: number
}

export interface InventoryProductSnapshot {
  id: string
  businessId: string
  sku: string
  name: string
  barcode?: string
  price: number
  cost: number
  stockCurrent: number
  stockMin: number
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

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
  ): Promise<InventoryProductSnapshot> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const initialStock = dto.initialStock ?? 0

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
    })

    if (initialStock > 0) {
      await this.inventoryMovementRepository.create({
        businessId,
        productId: product.id,
        type: InventoryMovementType.IN,
        quantity: initialStock,
        reason: `INITIAL_STOCK by ${userId || "system"}`,
        createdBy: userId || "system"
      })
    }

    return {
      id: product.id,
      businessId: product.businessId,
      sku: product.sku,
      name: product.name,
      barcode: product.barcode,
      price: Number(product.price),
      cost: Number(product.cost),
      stockCurrent: product.stockCurrent,
      stockMin: product.stockMin,
      isActive: product.isActive,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  }

  async listProducts(
    businessId: string,
    query: ListProductsQueryDto
  ): Promise<Record<string, unknown>> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    if (
      query.minCost !== undefined &&
      query.maxCost !== undefined &&
      query.minCost > query.maxCost
    ) {
      throw new BadRequestException("minCost cannot be greater than maxCost")
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const { items, total } = await this.productRepository.findPaginated({
      businessId,
      page,
      limit,
      name: query.name,
      minCost: query.minCost,
      maxCost: query.maxCost
    })

    const data = items.map((row) => ({
      id: row.id,
      businessId: row.businessId,
      sku: row.sku,
      name: row.name,
      barcode: row.barcode,
      price: Number(row.price),
      cost: Number(row.cost),
      stockCurrent: row.stockCurrent,
      stockMin: row.stockMin,
      isActive: row.isActive,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    businessId: string
  ): Promise<InventoryProductSnapshot> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const product = await this.productRepository.findById(id, businessId)
    if (!product) {
      throw new NotFoundException("Product not found")
    }

    const updatePayload: Partial<ProductTypeOrmEntity> = {}

    if (dto.sku !== undefined) {
      updatePayload.sku = dto.sku
    }
    if (dto.name !== undefined) {
      updatePayload.name = dto.name
    }
    if (dto.barcode !== undefined) {
      updatePayload.barcode = dto.barcode
    }
    if (dto.price !== undefined) {
      updatePayload.price = this.toMoney(dto.price)
    }
    if (dto.cost !== undefined) {
      updatePayload.cost = this.toMoney(dto.cost)
    }
    if (dto.stockMin !== undefined) {
      updatePayload.stockMin = dto.stockMin
    }

    const updatedProduct = await this.productRepository.update(id, businessId, updatePayload)
    return {
      id: updatedProduct.id,
      businessId: updatedProduct.businessId,
      sku: updatedProduct.sku,
      name: updatedProduct.name,
      barcode: updatedProduct.barcode,
      price: Number(updatedProduct.price),
      cost: Number(updatedProduct.cost),
      stockCurrent: updatedProduct.stockCurrent,
      stockMin: updatedProduct.stockMin,
      isActive: updatedProduct.isActive,
      createdBy: updatedProduct.createdBy,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    }
  }

  async deactivateProduct(productId: string, businessId: string): Promise<void> {
    if (!productId || !businessId) {
      throw new BadRequestException("productId and businessId are required")
    }

    const deactivated = await this.productRepository.deactivate(productId, businessId)
    if (!deactivated) {
      throw new NotFoundException("Product not found")
    }
  }

  async listLowStock(
    businessId: string,
    query: ListLowStockQueryDto
  ): Promise<Record<string, unknown>> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const { items, total } = await this.productRepository.findLowStockPaginated({
      businessId,
      page,
      limit,
      name: query.name
    })

    const data = items.map((row) => ({
      id: row.id,
      businessId: row.businessId,
      sku: row.sku,
      name: row.name,
      barcode: row.barcode,
      stockCurrent: row.stockCurrent,
      stockMin: row.stockMin,
      price: Number(row.price),
      cost: Number(row.cost)
    }))

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getProductsSnapshotForSale(
    businessId: string,
    productIds: string[],
    manager: EntityManager
  ): Promise<Map<string, SaleInventoryProductSnapshot>> {
    if (productIds.length === 0) {
      return new Map<string, SaleInventoryProductSnapshot>()
    }

    const uniqueProductIds = [...new Set(productIds)]
    const products = await manager.getRepository(ProductTypeOrmEntity).find({
      where: uniqueProductIds.map((id) => ({ id, businessId, isActive: true }))
    })

    return new Map(
      products.map((product) => [
        product.id,
        {
          id: product.id,
          price: Number(product.price),
          cost: Number(product.cost),
          stockCurrent: product.stockCurrent
        }
      ])
    )
  }

  async assertStockAvailability(
    businessId: string,
    requiredByProduct: Map<string, number>,
    manager: EntityManager
  ): Promise<void> {
    const productIds = [...requiredByProduct.keys()]
    const products = await this.getProductsSnapshotForSale(businessId, productIds, manager)

    for (const [productId, requiredQuantity] of requiredByProduct.entries()) {
      const product = products.get(productId)
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found or inactive`)
      }
      if (product.stockCurrent < requiredQuantity) {
        throw new BadRequestException(`Insufficient stock for product ${productId}`)
      }
    }
  }

  async discountStockForSale(
    businessId: string,
    saleId: string,
    userId: string,
    requiredByProduct: Map<string, number>,
    manager: EntityManager
  ): Promise<void> {
    for (const [productId, quantity] of requiredByProduct.entries()) {
      const productRepo = manager.getRepository(ProductTypeOrmEntity)
      const product = await productRepo.findOne({
        where: { id: productId, businessId, isActive: true }
      })
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found or inactive`)
      }

      if (product.stockCurrent < quantity) {
        throw new BadRequestException(`Insufficient stock for product ${productId}`)
      }

      product.stockCurrent -= quantity
      await productRepo.save(product)

      await manager.getRepository(InventoryMovementTypeOrmEntity).save({
        businessId,
        productId,
        type: InventoryMovementType.OUT,
        quantity,
        reason: `SALE ${saleId}`,
        createdBy: userId,
        createdAt: new Date()
      })
    }
  }

  private toMoney(amount: number): string {
    return amount.toFixed(2)
  }
}
