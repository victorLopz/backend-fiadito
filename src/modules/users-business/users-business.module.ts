import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "../auth/auth.module"
import { GetBusinessService } from "./application/use-cases/get-business.service"
import { GetMeService } from "./application/use-cases/get-me.service"
import { UploadBusinessLogoService } from "./application/use-cases/upload-business-logo.service"
import { UpdateBusinessService } from "./application/use-cases/update-business.service"
import { UpdateMeService } from "./application/use-cases/update-me.service"
import {
  BUSINESS_PROFILE_REPOSITORY
} from "./domain/repositories/business-profile.repository"
import {
  USER_PROFILE_REPOSITORY
} from "./domain/repositories/user-profile.repository"
import { TypeOrmBusinessProfileRepository } from "./infrastructure/persistence/repositories/typeorm-business-profile.repository"
import { TypeOrmUserProfileRepository } from "./infrastructure/persistence/repositories/typeorm-user-profile.repository"
import { UsersBusinessController } from "./presentation/controllers/users-business.controller"
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"
import { BusinessLogoStorageAdapter } from "./infrastructure/adapters/business-logo-storage.adapter"

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserTypeOrmEntity, BusinessTypeOrmEntity])],
  controllers: [UsersBusinessController],
  providers: [
    GetMeService,
    UpdateMeService,
    GetBusinessService,
    UpdateBusinessService,
    UploadBusinessLogoService,
    BusinessLogoStorageAdapter,
    TypeOrmUserProfileRepository,
    TypeOrmBusinessProfileRepository,
    { provide: USER_PROFILE_REPOSITORY, useExisting: TypeOrmUserProfileRepository },
    { provide: BUSINESS_PROFILE_REPOSITORY, useExisting: TypeOrmBusinessProfileRepository }
  ],
  exports: [
    GetMeService,
    UpdateMeService,
    GetBusinessService,
    UpdateBusinessService,
    UploadBusinessLogoService
  ]
})
export class UsersBusinessModule {}
