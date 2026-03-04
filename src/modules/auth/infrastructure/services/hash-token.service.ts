import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload, TokenService } from 'src/modules/auth/domain/services/token.service';

@Injectable()
export class HashTokenService implements TokenService {
  private readonly accessTokenSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'access-dev-secret';
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid access token');
    }

    const expectedSignature = createHash('sha256').update(encodedPayload).update(this.accessTokenSecret).digest('hex');
    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid access token');
    }

    try {
      const raw = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload = JSON.parse(raw) as Partial<AccessTokenPayload>;

      if (!payload.sub || !payload.businessId) {
        throw new UnauthorizedException('Invalid access token');
      }

      return {
        sub: payload.sub,
        businessId: payload.businessId,
        ...(payload.iat ? { iat: payload.iat } : {}),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Unable to decode access token');
    }
  }
}
