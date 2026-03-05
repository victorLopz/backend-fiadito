export class InventoryItem {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly stockCurrent: number,
    public readonly stockMin: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
