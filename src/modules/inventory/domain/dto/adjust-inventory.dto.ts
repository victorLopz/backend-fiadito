export class AdjustInventoryInputDto {
  productId!: string
  quantity!: number
  reason!: string
  createdBy!: string
}

export class AdjustInventoryOutputDto {
  productId!: string
  previousStock!: number
  newStock!: number
  adjustedQuantity!: number
  reason!: string
  movementDate!: Date
}
