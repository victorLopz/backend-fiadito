export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE")

export type AccessTokenPayload = {
  sub: string
  businessId: string
  iat?: number
}

export interface TokenService {
  verifyAccessToken(token: string): Promise<AccessTokenPayload>
}
