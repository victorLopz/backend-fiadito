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
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"

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
  ): Promise<Record<string, unknown>> {
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

  async updateProduct(id: string, dto: UpdateProductDto, businessId: string): Promise<void> {
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

    await this.productRepository.update(id, businessId, updatePayload)
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

  private toMoney(amount: number): string {
    return amount.toFixed(2)
  }
}
