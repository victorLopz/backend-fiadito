export class StockEntryInputDto {
  productId!: string
  quantity!: number
  reason?: string
  createdBy!: string
}

export class StockEntryOutputDto {
  productId!: string
  previousStock!: number
  newStock!: number
  movementType!: string
  movementQuantity!: number
  movementDate!: Date
}
