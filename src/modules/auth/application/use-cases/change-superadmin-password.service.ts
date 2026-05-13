import * as argon2 from "argon2"
import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import {
  TOKEN_REPOSITORY,
  TokenRepository
} from "src/modules/auth/domain/repositories/token.repository"
import {
  USER_REPOSITORY,
  UserRepository
} from "src/modules/auth/domain/repositories/user.repository"

@Injectable()
export class ChangeSuperadminPasswordService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepository
  ) {}

  async execute(userId: string, newPassword: string): Promise<{
    id: string
    businessId: string
    fullName: string
    email?: string
    phone?: string
    role: string
    isActive: boolean
    passwordChanged: true
  }> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundException("User not found")
    }

    const passwordHash = await argon2.hash(newPassword)

    await this.userRepository.updatePasswordHash(user.id, passwordHash)
    await this.tokenRepository.revokeActiveRefreshTokensForUser(user.id)

    return {
      id: user.id,
      businessId: user.businessId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneE164,
      role: user.role,
      isActive: user.isActive,
      passwordChanged: true
    }
  }
}
