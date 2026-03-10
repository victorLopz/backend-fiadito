export class BusinessProfile {
  constructor(
    public readonly id: string,
    public readonly legalName: string,
    public readonly currencyCode: string | null,
    public readonly countryCode: string | null,
    public readonly timezone: string | null,
    public readonly receiptPrefix: string | null,
    public readonly receiptNextNumber: number | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
