import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_SERVICE, TokenService } from 'src/modules/auth/domain/services/token.service';
import { USER_REPOSITORY, UserRepository } from 'src/modules/auth/domain/repositories/user.repository';
import { AuthUser } from '../interfaces';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = await this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findActiveByIdAndBusiness(payload.sub, payload.businessId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid session');
    }

    const authUser: AuthUser = {
      id: user.id,
      businessId: user.businessId,
      iat: payload.iat,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneE164,
    };

    (request as Request & { user: AuthUser }).user = authUser;
    (request as Request & { businessId?: string }).businessId = authUser.businessId;
    request.headers['x-business-id'] = authUser.businessId;

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization ?? '';
    const [type, bearerToken] = authHeader.split(' ');

    if (type === 'Bearer' && bearerToken) {
      return bearerToken;
    }

    const fallbackHeader = request.headers['x-access-token'];
    if (typeof fallbackHeader === 'string' && fallbackHeader.trim()) {
      return fallbackHeader.trim();
    }

    return null;
  }
}
