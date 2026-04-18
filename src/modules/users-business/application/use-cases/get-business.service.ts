import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { BusinessOutput } from "../../domain/dto/business.output"
import {
  BUSINESS_PROFILE_REPOSITORY,
  BusinessProfileRepository
} from "../../domain/repositories/business-profile.repository"

@Injectable()
export class GetBusinessService {
  constructor(
    @Inject(BUSINESS_PROFILE_REPOSITORY)
    private readonly businessProfileRepository: BusinessProfileRepository
  ) {}

  async execute(businessId: string): Promise<BusinessOutput> {
    const business = await this.businessProfileRepository.findById(businessId)

    if (!business) {
      throw new NotFoundException("Business not found")
    }

    return {
      id: business.id,
      legalName: business.legalName,
      logoUrl: business.logoUrl,
      currencyCode: business.currencyCode,
      countryCode: business.countryCode,
      timezone: business.timezone,
      receiptPrefix: business.receiptPrefix,
      receiptNextNumber: business.receiptNextNumber,
      isActive: business.isActive,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }
  }
}
