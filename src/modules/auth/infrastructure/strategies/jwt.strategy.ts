import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import {
  USER_REPOSITORY,
  UserRepository
} from "src/modules/auth/domain/repositories/user.repository"
import { AccessTokenPayload } from "src/modules/auth/domain/services/token.service"
import { AuthUser } from "src/shared/common/interfaces"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { headers?: Record<string, unknown> }) => {
          const header = request.headers?.["x-access-token"]
          return typeof header === "string" ? header : null
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET") ?? "access-dev-secret",
      algorithms: ["HS256"]
    })
  }

  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    if (!payload.sub || !payload.businessId) {
      throw new UnauthorizedException("Invalid token payload")
    }

    const user = await this.userRepository.findActiveByIdAndBusiness(payload.sub, payload.businessId)
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid session")
    }

    return {
      id: user.id,
      businessId: user.businessId,
      iat: payload.iat,
      exp: payload.exp,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phoneE164
    }
  }
}
