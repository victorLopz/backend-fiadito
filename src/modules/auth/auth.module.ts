import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./application/use-cases/auth.service";
import {
  BUSINESS_REPOSITORY,
  BusinessRepository
} from "./domain/repositories/business.repository";
import { OTP_REPOSITORY, OtpRepository } from "./domain/repositories/otp.repository";
import {
  SESSION_REPOSITORY,
  SessionRepository
} from "./domain/repositories/session.repository";
import {
  TOKEN_REPOSITORY,
  TokenRepository
} from "./domain/repositories/token.repository";
import { USER_REPOSITORY, UserRepository } from "./domain/repositories/user.repository";
import { TOKEN_SERVICE, TokenService } from "./domain/services/token.service";
import { TypeOrmBusinessRepository } from "./infrastructure/repositories/typeorm-business.repository";
import { TypeOrmOtpRepository } from "./infrastructure/repositories/typeorm-otp.repository";
import { TypeOrmSessionRepository } from "./infrastructure/repositories/typeorm-session.repository";
import { TypeOrmTokenRepository } from "./infrastructure/repositories/typeorm-token.repository";
import { TypeOrmUserRepository } from "./infrastructure/repositories/typeorm-user.repository";
import { HashTokenService } from "./infrastructure/services/hash-token.service";
import { AuthController } from "./presentation/controllers/auth.controller";
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard";
import { AuthTokenTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/auth-token.typeorm-entity";
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity";
import { OtpCodeTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/otp-code.typeorm-entity";
import { UserSessionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user-session.typeorm-entity";
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      BusinessTypeOrmEntity,
      OtpCodeTypeOrmEntity,
      AuthTokenTypeOrmEntity,
      UserSessionTypeOrmEntity
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TypeOrmUserRepository,
    TypeOrmBusinessRepository,
    TypeOrmOtpRepository,
    TypeOrmTokenRepository,
    TypeOrmSessionRepository,
    HashTokenService,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useExisting: TypeOrmUserRepository },
    { provide: BUSINESS_REPOSITORY, useExisting: TypeOrmBusinessRepository },
    { provide: OTP_REPOSITORY, useExisting: TypeOrmOtpRepository },
    { provide: TOKEN_REPOSITORY, useExisting: TypeOrmTokenRepository },
    { provide: SESSION_REPOSITORY, useExisting: TypeOrmSessionRepository },
    { provide: TOKEN_SERVICE, useExisting: HashTokenService }
  ],
  exports: [AuthService, USER_REPOSITORY, TOKEN_SERVICE, JwtAuthGuard]
})
export class AuthModule {}
