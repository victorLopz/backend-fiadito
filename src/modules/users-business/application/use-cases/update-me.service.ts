import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UpdateMeDto } from "../dto/update-me.dto"
import { MeOutput } from "../../domain/dto/me.output"
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository
} from "../../domain/repositories/user-profile.repository"
import { UpdateMeInput } from "../../domain/dto/update-me.input"

@Injectable()
export class UpdateMeService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository
  ) {}

  async execute(userId: string, businessId: string, dto: UpdateMeDto): Promise<MeOutput> {
    const currentProfile = await this.userProfileRepository.findByIdAndBusiness(userId, businessId)

    if (!currentProfile) {
      throw new NotFoundException("User not found")
    }

    const input: UpdateMeInput = {}

    if (dto.fullName !== undefined) {
      input.fullName = dto.fullName.trim()
    }

    if (dto.email !== undefined) {
      input.email = dto.email.trim().toLowerCase()
    }

    if (dto.phoneE164 !== undefined) {
      input.phoneE164 = dto.phoneE164.trim()
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one field is required")
    }

    await this.userProfileRepository.update(userId, businessId, input)

    const updatedProfile = await this.userProfileRepository.findByIdAndBusiness(userId, businessId)

    if (!updatedProfile) {
      throw new NotFoundException("User not found")
    }

    return {
      id: updatedProfile.id,
      businessId: updatedProfile.businessId,
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      phoneE164: updatedProfile.phoneE164,
      isActive: updatedProfile.isActive,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt
    }
  }
}
