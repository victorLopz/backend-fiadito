import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UpdateBusinessDto } from "../dto/update-business.dto"
import { BusinessOutput } from "../../domain/dto/business.output"
import {
  BUSINESS_PROFILE_REPOSITORY,
  BusinessProfileRepository
} from "../../domain/repositories/business-profile.repository"
import { UpdateBusinessInput } from "../../domain/dto/update-business.input"

@Injectable()
export class UpdateBusinessService {
  constructor(
    @Inject(BUSINESS_PROFILE_REPOSITORY)
    private readonly businessProfileRepository: BusinessProfileRepository
  ) {}

  async execute(businessId: string, dto: UpdateBusinessDto): Promise<BusinessOutput> {
    const currentBusiness = await this.businessProfileRepository.findById(businessId)

    if (!currentBusiness) {
      throw new NotFoundException("Business not found")
    }

    const input: UpdateBusinessInput = {}

    if (dto.legalName !== undefined) {
      input.legalName = dto.legalName.trim()
    }

    if (dto.currencyCode !== undefined) {
      input.currencyCode = dto.currencyCode.trim().toUpperCase()
    }

    if (dto.countryCode !== undefined) {
      input.countryCode = dto.countryCode.trim().toUpperCase()
    }

    if (dto.timezone !== undefined) {
      input.timezone = dto.timezone.trim()
    }

    if (dto.receiptPrefix !== undefined) {
      input.receiptPrefix = dto.receiptPrefix.trim().toUpperCase()
    }

    if (dto.receiptNextNumber !== undefined) {
      input.receiptNextNumber = dto.receiptNextNumber
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one field is required")
    }

    await this.businessProfileRepository.update(businessId, input)

    const updatedBusiness = await this.businessProfileRepository.findById(businessId)

    if (!updatedBusiness) {
      throw new NotFoundException("Business not found")
    }

    return {
      id: updatedBusiness.id,
      legalName: updatedBusiness.legalName,
      currencyCode: updatedBusiness.currencyCode,
      countryCode: updatedBusiness.countryCode,
      timezone: updatedBusiness.timezone,
      receiptPrefix: updatedBusiness.receiptPrefix,
      receiptNextNumber: updatedBusiness.receiptNextNumber,
      isActive: updatedBusiness.isActive,
      createdAt: updatedBusiness.createdAt,
      updatedAt: updatedBusiness.updatedAt
    }
  }
}
