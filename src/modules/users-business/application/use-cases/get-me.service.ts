import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { MeOutput } from "../../domain/dto/me.output"
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository
} from "../../domain/repositories/user-profile.repository"

@Injectable()
export class GetMeService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository
  ) {}

  async execute(userId: string, businessId: string): Promise<MeOutput> {
    const profile = await this.userProfileRepository.findByIdAndBusiness(userId, businessId)

    if (!profile) {
      throw new NotFoundException("User not found")
    }

    return {
      id: profile.id,
      businessId: profile.businessId,
      fullName: profile.fullName,
      email: profile.email,
      phoneE164: profile.phoneE164,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}
