import { createHash } from "crypto"
import { Injectable, NestMiddleware } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NextFunction, Request, Response } from "express"
import { AuthUser } from "../interfaces"

type TokenPayload = {
  sub?: string
  businessId?: string
  iat?: number
  fullName?: string
  email?: string
  phone?: string
}

@Injectable()
export class BusinessContextMiddleware implements NestMiddleware {
  private readonly accessTokenSecret: string

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret =
      this.configService.get<string>("JWT_ACCESS_SECRET") ?? "access-dev-secret"
  }

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
      ...(parsed.fullName ? { fullName: parsed.fullName } : {}),
      ...(parsed.email ? { email: parsed.email } : {}),
      ...(parsed.phone ? { phone: parsed.phone } : {})
    }

    req.businessId = parsed.businessId
    req.headers["x-business-id"] = parsed.businessId

    return next()
  }

  private parseAndValidateToken(token: string): TokenPayload | null {
    const [encodedPayload, signature] = token.split(".")
    if (!encodedPayload || !signature) {
      return null
    }

    const expectedSignature = createHash("sha256")
      .update(encodedPayload)
      .update(this.accessTokenSecret)
      .digest("hex")
    if (expectedSignature !== signature) {
      return null
    }

    try {
      const raw = Buffer.from(encodedPayload, "base64url").toString("utf8")
      const payload = JSON.parse(raw) as TokenPayload
      if (!payload.businessId || typeof payload.businessId !== "string") {
        return null
      }
      return payload
    } catch {
      return null
    }
  }
}
