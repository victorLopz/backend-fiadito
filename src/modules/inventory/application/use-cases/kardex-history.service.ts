import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { KardexHistoryOutputDto } from "../../domain/dto/kardex-history.dto"
import {
  INVENTORY_MOVEMENT_REPOSITORY,
  InventoryMovementRepository
} from "../../domain/repositories/inventory-movement.repository"
import { KardexQueryDto } from "../dto/kardex-query.dto"

@Injectable()
export class KardexHistoryService {
  constructor(
    @Inject(INVENTORY_MOVEMENT_REPOSITORY)
    private readonly inventoryMovementRepository: InventoryMovementRepository
  ) {}

  async execute(businessId: string, query: KardexQueryDto): Promise<KardexHistoryOutputDto> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const { items, total } = await this.inventoryMovementRepository.findKardex(businessId, {
      productId: query.productId,
      type: query.type,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      page,
      limit
    })

    return {
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
