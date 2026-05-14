import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthService } from "./application/use-cases/auth.service"
import { ChangeSuperadminPasswordService } from "./application/use-cases/change-superadmin-password.service"
import { DeleteUserService } from "./application/use-cases/delete-user.service"
import { DeleteUsersService } from "./application/use-cases/delete-users.service"
import { MembershipsModule } from "src/modules/memberships/memberships.module"
import { BUSINESS_REPOSITORY } from "./domain/repositories/business.repository"
import { OTP_REPOSITORY } from "./domain/repositories/otp.repository"
import { SESSION_REPOSITORY } from "./domain/repositories/session.repository"
import { TOKEN_REPOSITORY } from "./domain/repositories/token.repository"
import { USER_REPOSITORY } from "./domain/repositories/user.repository"
import { TypeOrmBusinessRepository } from "./infrastructure/repositories/typeorm-business.repository"
import { TypeOrmOtpRepository } from "./infrastructure/repositories/typeorm-otp.repository"
import { TypeOrmSessionRepository } from "./infrastructure/repositories/typeorm-session.repository"
import { TypeOrmTokenRepository } from "./infrastructure/repositories/typeorm-token.repository"
import { TypeOrmUserRepository } from "./infrastructure/repositories/typeorm-user.repository"
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy"
import { AuthController } from "./presentation/controllers/auth.controller"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { AuthTokenTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/auth-token.typeorm-entity"
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity"
import { OtpCodeTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/otp-code.typeorm-entity"
import { UserSessionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user-session.typeorm-entity"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"

@Module({
  imports: [
    ConfigModule,
    MembershipsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_ACCESS_SECRET") ?? "access-dev-secret",
        signOptions: {
          algorithm: "HS256",
          expiresIn: configService.get<string>("JWT_ACCESS_EXPIRES_IN")
        }
      })
    }),
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
    ChangeSuperadminPasswordService,
    DeleteUserService,
    DeleteUsersService,
    TypeOrmUserRepository,
    TypeOrmBusinessRepository,
    TypeOrmOtpRepository,
    TypeOrmTokenRepository,
    TypeOrmSessionRepository,
    JwtStrategy,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useExisting: TypeOrmUserRepository },
    { provide: BUSINESS_REPOSITORY, useExisting: TypeOrmBusinessRepository },
    { provide: OTP_REPOSITORY, useExisting: TypeOrmOtpRepository },
    { provide: TOKEN_REPOSITORY, useExisting: TypeOrmTokenRepository },
    { provide: SESSION_REPOSITORY, useExisting: TypeOrmSessionRepository }
  ],
  exports: [AuthService, USER_REPOSITORY, PassportModule, JwtModule, JwtAuthGuard]
})
export class AuthModule {}
