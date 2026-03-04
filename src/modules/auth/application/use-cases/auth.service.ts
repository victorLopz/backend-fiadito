import { createCipheriv, createHash, randomBytes, randomUUID } from "crypto"
import * as argon2 from "argon2"
import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  BUSINESS_REPOSITORY,
  BusinessRepository
} from "src/modules/auth/domain/repositories/business.repository"
import { OTP_REPOSITORY, OtpRepository } from "src/modules/auth/domain/repositories/otp.repository"
import {
  SESSION_REPOSITORY,
  SessionRepository
} from "src/modules/auth/domain/repositories/session.repository"
import {
  TOKEN_REPOSITORY,
  TokenRepository
} from "src/modules/auth/domain/repositories/token.repository"
import {
  USER_REPOSITORY,
  UserRepository
} from "src/modules/auth/domain/repositories/user.repository"
import { OtpPurpose, UserRole } from "src/shared/infrastructure/persistence/entities/enums"

type SessionResponse = {
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: "Bearer"
    business: {
      id: string
      name: string
      isActive: boolean
    }
    user: {
      id: string
      businessId: string
      fullName: string
      email?: string
      phone?: string
      isActive: boolean
    }
  }
}

type CreateUserInput = {
  businessName?: string
  fullName: string
  email?: string
  phone?: string
  password: string
  role?: UserRole
}

type AuthenticatedUser = {
  id: string
  businessId: string
  fullName: string
  email?: string
  phone?: string
  isActive: boolean
}

@Injectable()
export class AuthService {
  private readonly otpRegex = /^\+[1-9]\d{6,14}$/
  private readonly otpTtlMs = 5 * 60 * 1000
  private readonly otpMaxAttempts = 5
  private readonly accessExpiresInSeconds = 900
  private readonly refreshTtlMs = 30 * 24 * 60 * 60 * 1000
  private readonly loginByOtpEnabled: boolean
  private readonly accessTokenSecret: string

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepository,
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: OtpRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService
  ) {
    this.loginByOtpEnabled = this.configService.get<string>("AUTH_LOGIN_WITH_OTP") === "true"
    this.accessTokenSecret =
      this.configService.get<string>("JWT_ACCESS_SECRET") ?? "access-dev-secret"
  }

  async createUser(input: CreateUserInput): Promise<{
    id: string
    businessId: string
    fullName: string
    email?: string
    phone?: string
  }> {
    if (!input.email && !input.phone) {
      throw new BadRequestException("email or phone is required")
    }

    const businessName = input.businessName?.trim()
    if (!businessName) {
      throw new BadRequestException("businessName is required")
    }

    const normalizedPhone = input.phone?.trim()
    if (normalizedPhone && !this.otpRegex.test(normalizedPhone)) {
      throw new BadRequestException("phone must be E.164")
    }

    const normalizedEmail = input.email?.trim().toLowerCase()

    if (await this.businessRepository.existsByName(businessName)) {
      throw new BadRequestException("Business name already exists")
    }

    if (normalizedPhone && (await this.userRepository.existsByPhone(normalizedPhone))) {
      throw new BadRequestException("Phone number already exists")
    }

    if (normalizedEmail && (await this.userRepository.existsByEmail(normalizedEmail))) {
      throw new BadRequestException("Email already exists")
    }

    const business = await this.businessRepository.create({
      id: randomUUID(),
      name: businessName
    })

    const passwordHash = await argon2.hash(input.password)
    const user = await this.userRepository.create({
      id: randomUUID(),
      businessId: business.id,
      fullName: input.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role: this.parseUserRole(input.role)
    })

    return {
      id: user.id,
      businessId: user.businessId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneE164
    }
  }

  async requestOtp(destinationMobile: string, purpose: string): Promise<void> {
    if (!this.otpRegex.test(destinationMobile)) {
      throw new UnauthorizedException("destinationMobile must be E.164")
    }

    const purposeValue = this.parseOtpPurpose(purpose)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await argon2.hash(code)

    await this.otpRepository.invalidateActiveOtps(destinationMobile, purposeValue)
    await this.otpRepository.createOtp({
      destination: destinationMobile,
      purpose: purposeValue,
      codeHash,
      expiresAt: new Date(Date.now() + this.otpTtlMs)
    })

    const encryptedPayload = this.encryptOtpForSms(code, destinationMobile)
    this.sendOtpSmsEncrypted(destinationMobile, encryptedPayload)
  }

  async verifyOtp(
    destinationMobile: string,
    code: string,
    purpose: string
  ): Promise<SessionResponse> {
    const purposeValue = this.parseOtpPurpose(purpose)
    const otp = await this.otpRepository.getLatestActiveOtp(destinationMobile, purposeValue)

    if (!otp) {
      throw new UnauthorizedException("OTP not found")
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("OTP expired")
    }

    if (otp.attempts >= this.otpMaxAttempts) {
      throw new UnauthorizedException("OTP attempts exceeded")
    }

    const validCode = await argon2.verify(otp.codeHash, code)
    if (!validCode) {
      await this.otpRepository.incrementAttempts(otp.id, otp.attempts + 1)
      throw new UnauthorizedException("Invalid OTP")
    }

    await this.otpRepository.consumeOtp(otp.id)

    if (purposeValue !== OtpPurpose.LOGIN) {
      throw new BadRequestException("Only LOGIN purpose can create a session")
    }

    const user = await this.userRepository.findActiveByPhone(destinationMobile)
    if (!user) {
      throw new UnauthorizedException("User not found for this phone number")
    }

    return this.issueSession({
      id: user.id,
      businessId: user.businessId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneE164,
      isActive: user.isActive
    })
  }

  async loginWithPhone(
    destinationMobile: string,
    password: string
  ): Promise<{ requiresOtp?: boolean; session?: SessionResponse["session"] }> {
    if (!password) {
      throw new BadRequestException("password is required")
    }

    const user = await this.userRepository.findActiveByPhone(destinationMobile)
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const validPassword = await argon2.verify(user.passwordHash, password)
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials")
    }

    if (this.loginByOtpEnabled) {
      await this.requestOtp(destinationMobile, OtpPurpose.LOGIN)
      return { requiresOtp: true }
    }

    const session = await this.issueSession({
      id: user.id,
      businessId: user.businessId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneE164,
      isActive: user.isActive
    })
    return { session: session.session }
  }

  async refreshToken(
    rotationToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [tokenId, secret] = rotationToken.split(".")
    if (!tokenId || !secret) {
      throw new UnauthorizedException("Invalid refresh token format")
    }

    const token = await this.tokenRepository.findActiveRefreshTokenById(tokenId)
    if (!token || token.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("Refresh token expired or revoked")
    }

    const valid = await argon2.verify(token.tokenHash, secret)
    if (!valid) {
      throw new UnauthorizedException("Refresh token is invalid")
    }

    const user = await this.userRepository.findActiveByIdAndBusiness(token.userId, token.businessId)
    if (!user) {
      throw new UnauthorizedException("User not available for refresh")
    }

    await this.tokenRepository.revokeToken(token.id)

    const nextSecret = this.generateOpaqueToken(32)
    const nextHash = await argon2.hash(nextSecret)
    const next = await this.tokenRepository.saveRefreshTokenHash({
      businessId: user.businessId,
      userId: user.id,
      tokenHash: nextHash,
      expiresAt: new Date(Date.now() + this.refreshTtlMs)
    })

    return {
      accessToken: this.generateAccessToken({
        id: user.id,
        businessId: user.businessId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneE164,
        isActive: user.isActive
      }),
      refreshToken: `${next.id}.${nextSecret}`
    }
  }

  private async issueSession(user: AuthenticatedUser): Promise<SessionResponse> {
    const business = await this.businessRepository.findById(user.businessId)
    if (!business) {
      throw new UnauthorizedException("Business not found for this user")
    }

    await this.sessionRepository.create({
      businessId: user.businessId,
      userId: user.id
    })

    const refreshSecret = this.generateOpaqueToken(32)
    const refreshHash = await argon2.hash(refreshSecret)

    const refreshToken = await this.tokenRepository.saveRefreshTokenHash({
      businessId: user.businessId,
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + this.refreshTtlMs)
    })

    return {
      session: {
        accessToken: this.generateAccessToken(user),
        refreshToken: `${refreshToken.id}.${refreshSecret}`,
        expiresIn: this.accessExpiresInSeconds,
        tokenType: "Bearer",
        business: {
          id: business.id,
          name: business.name,
          isActive: business.isActive
        },
        user: {
          id: user.id,
          businessId: user.businessId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive
        }
      }
    }
  }

  private parseOtpPurpose(purpose: string): OtpPurpose {
    if (Object.values(OtpPurpose).includes(purpose as OtpPurpose)) {
      return purpose as OtpPurpose
    }
    throw new BadRequestException("Invalid OTP purpose")
  }

  private parseUserRole(role?: UserRole): UserRole {
    if (!role) {
      return UserRole.CASHIER
    }

    if (Object.values(UserRole).includes(role)) {
      return role
    }

    throw new BadRequestException("Invalid user role")
  }

  private generateOpaqueToken(bytes: number): string {
    return createHash("sha256")
      .update(randomBytes(bytes))
      .update(Date.now().toString())
      .digest("hex")
  }

  private generateAccessToken(user: AuthenticatedUser): string {
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        businessId: user.businessId,
        iat: Date.now()
      })
    ).toString("base64url")

    const signature = createHash("sha256")
      .update(payload)
      .update(this.accessTokenSecret)
      .digest("hex")

    return `${payload}.${signature}`
  }

  private encryptOtpForSms(code: string, destinationMobile: string): string {
    const iv = randomBytes(16)
    const key = randomBytes(32)
    const cipher = createCipheriv("aes-256-cbc", key, iv)
    const payload = JSON.stringify({ code, destinationMobile, ts: Date.now() })

    const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()])
    return `${iv.toString("hex")}.${encrypted.toString("hex")}`
  }

  private sendOtpSmsEncrypted(destinationMobile: string, encryptedPayload: string): void {
    void { destinationMobile, encryptedPayload }
  }
}
