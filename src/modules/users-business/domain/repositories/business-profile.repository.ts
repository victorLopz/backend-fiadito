import { BusinessProfile } from "../entities/business-profile.entity"

export const BUSINESS_PROFILE_REPOSITORY = Symbol("BUSINESS_PROFILE_REPOSITORY")

export interface BusinessProfileRepository {
  findById(id: string): Promise<BusinessProfile | null>
  update(id: string, input: {
    legalName?: string
    logoUrl?: string
    currencyCode?: string
    countryCode?: string
    timezone?: string
    receiptPrefix?: string
    receiptNextNumber?: number
  }): Promise<void>
}
