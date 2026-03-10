export class BusinessOutput {
  id!: string
  legalName!: string
  currencyCode!: string | null
  countryCode!: string | null
  timezone!: string | null
  receiptPrefix!: string | null
  receiptNextNumber!: number | null
  isActive!: boolean
  createdAt!: Date
  updatedAt!: Date
}
