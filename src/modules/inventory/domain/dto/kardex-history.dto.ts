export interface KardexHistoryFilterDto {
  productId?: string
  type?: string
  fromDate?: Date
  toDate?: Date
  page: number
  limit: number
}

export interface KardexHistoryItemDto {
  movementId: string
  productId: string
  productName: string
  sku: string
  type: string
  quantity: number
  reason: string | null
  createdBy: string
  createdAt: Date
}

export interface KardexHistoryOutputDto {
  data: KardexHistoryItemDto[]
  page: number
  limit: number
  total: number
  totalPages: number
}
