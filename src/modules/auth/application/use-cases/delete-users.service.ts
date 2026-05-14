import { BadRequestException, Injectable } from "@nestjs/common"
import { AuditLogTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/audit-log.typeorm-entity"
import { AuthTokenTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/auth-token.typeorm-entity"
import { DebtPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt-payment.typeorm-entity"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"
import { MembershipPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/membership-payment.typeorm-entity"
import { OtpCodeTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/otp-code.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"
import { UserSessionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user-session.typeorm-entity"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"
import { WhatsappMessageLogTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/whatsapp-message-log.typeorm-entity"
import { DataSource, EntityManager, In, Not } from "typeorm"
import { DeleteUsersQueryDto } from "../dto/delete-users-query.dto"

type UserDeletionCleanup = {
  authTokensDeleted: number
  userSessionsDeleted: number
  otpCodesDeleted: number
  debtPaymentsReleased: number
  membershipPaymentsReleased: number
  productsReassigned: number
  inventoryMovementsReassigned: number
  salesReassigned: number
}

type UserDeletionResult = {
  action: "deleted"
  deletedCount: number
  filter?: {
    businessId?: string
  }
  cleanup: UserDeletionCleanup
}

@Injectable()
export class DeleteUsersService {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    replacementUserId: string,
    query: DeleteUsersQueryDto = {}
  ): Promise<UserDeletionResult> {
    const users = await this.dataSource.getRepository(UserTypeOrmEntity).find({
      where: {
        ...(query.businessId ? { businessId: query.businessId } : {}),
        role: Not(UserRole.SUPERADMIN)
      },
      select: {
        id: true,
        businessId: true,
        phoneE164: true,
        role: true
      }
    })

    return this.deleteSelectedUsers(users, {
      replacementUserId,
      businessId: query.businessId
    })
  }

  async deleteSelectedUsers(
    users: Pick<UserTypeOrmEntity, "id" | "businessId" | "phoneE164" | "role">[],
    options: { replacementUserId: string; businessId?: string }
  ): Promise<UserDeletionResult> {
    if (users.some((user) => user.role === UserRole.SUPERADMIN)) {
      throw new BadRequestException("SUPERADMIN users cannot be deleted")
    }

    if (users.length === 0) {
      return {
        action: "deleted",
        deletedCount: 0,
        filter: {
          businessId: options.businessId
        },
        cleanup: this.emptyCleanup()
      }
    }

    const userIds = users.map((user) => user.id)
    const phoneNumbers = users
      .map((user) => user.phoneE164)
      .filter((phone): phone is string => Boolean(phone))

    return this.dataSource.transaction(async (manager) => {
      const cleanup = await this.cleanupUserReferences(
        manager,
        userIds,
        phoneNumbers,
        options.replacementUserId
      )
      const deleted = await manager.delete(UserTypeOrmEntity, { id: In(userIds) })

      return {
        action: "deleted",
        deletedCount: deleted.affected ?? 0,
        filter: {
          businessId: options.businessId
        },
        cleanup
      }
    })
  }

  private async cleanupUserReferences(
    manager: EntityManager,
    userIds: string[],
    phoneNumbers: string[],
    replacementUserId: string
  ): Promise<UserDeletionCleanup> {
    const products = await manager.update(
      ProductTypeOrmEntity,
      { createdBy: In(userIds) },
      { createdBy: replacementUserId }
    )
    const inventoryMovements = await manager.update(
      InventoryMovementTypeOrmEntity,
      { createdBy: In(userIds) },
      { createdBy: replacementUserId }
    )
    const sales = await manager.update(
      SaleTypeOrmEntity,
      { createdBy: In(userIds) },
      { createdBy: replacementUserId }
    )
    const debtPayments = await manager.update(
      DebtPaymentTypeOrmEntity,
      { receivedBy: In(userIds) },
      { receivedBy: null }
    )
    const membershipPayments = await manager.update(
      MembershipPaymentTypeOrmEntity,
      { createdBy: In(userIds) },
      { createdBy: null }
    )
    const authTokens = await manager.delete(AuthTokenTypeOrmEntity, { userId: In(userIds) })
    const userSessions = await manager.delete(UserSessionTypeOrmEntity, { userId: In(userIds) })
    const otpCodesByUser = await manager.delete(OtpCodeTypeOrmEntity, { userId: In(userIds) })
    const otpCodesByPhone =
      phoneNumbers.length > 0
        ? await manager.delete(OtpCodeTypeOrmEntity, { destination: In(phoneNumbers) })
        : { affected: 0 }

    return {
      authTokensDeleted: authTokens.affected ?? 0,
      userSessionsDeleted: userSessions.affected ?? 0,
      otpCodesDeleted: (otpCodesByUser.affected ?? 0) + (otpCodesByPhone.affected ?? 0),
      debtPaymentsReleased: debtPayments.affected ?? 0,
      membershipPaymentsReleased: membershipPayments.affected ?? 0,
      productsReassigned: products.affected ?? 0,
      inventoryMovementsReassigned: inventoryMovements.affected ?? 0,
      salesReassigned: sales.affected ?? 0
    }
  }

  private emptyCleanup(): UserDeletionCleanup {
    return {
      authTokensDeleted: 0,
      userSessionsDeleted: 0,
      otpCodesDeleted: 0,
      debtPaymentsReleased: 0,
      membershipPaymentsReleased: 0,
      productsReassigned: 0,
      inventoryMovementsReassigned: 0,
      salesReassigned: 0
    }
  }
}
