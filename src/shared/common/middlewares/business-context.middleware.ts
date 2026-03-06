import { Injectable, NestMiddleware } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { NextFunction, Request, Response } from "express"
import { AccessTokenPayload } from "src/modules/auth/domain/services/token.service"
import { AuthUser } from "../interfaces"

@Injectable()
export class BusinessContextMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  use(req: Request, _: Response, next: NextFunction): void {
    const authorization = req.headers.authorization
    if (!authorization?.startsWith("Bearer ")) {
      return next()
    }

    const token = authorization.slice("Bearer ".length).trim()
    const parsed = this.parseAndValidateToken(token)
    if (!parsed?.businessId) {
      return next()
    }

    const userFromReq = req.user ?? ({} as AuthUser)
    req.user = {
      ...userFromReq,
      ...(parsed.sub ? { id: parsed.sub } : {}),
      businessId: parsed.businessId,
      ...(parsed.iat ? { iat: parsed.iat } : {}),
      ...(parsed.exp ? { exp: parsed.exp } : {})
    }

    req.businessId = parsed.businessId
    req.headers["x-business-id"] = parsed.businessId

    return next()
  }

  private parseAndValidateToken(token: string): AccessTokenPayload | null {
    try {
      const payload = this.jwtService.verify<AccessTokenPayload>(token, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET") ?? "access-dev-secret",
        algorithms: ["HS256"]
      })
      if (!payload.sub || !payload.businessId) {
        return null
      }

      return payload
    } catch {
      return null
    }
  }
}
