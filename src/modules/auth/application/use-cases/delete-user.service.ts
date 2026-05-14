import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"
import { DataSource } from "typeorm"
import { DeleteUsersService } from "./delete-users.service"

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly deleteUsersService: DeleteUsersService
  ) {}

  async execute(userId: string, replacementUserId: string): Promise<Record<string, unknown>> {
    const user = await this.dataSource.getRepository(UserTypeOrmEntity).findOne({
      where: { id: userId },
      select: {
        id: true,
        businessId: true,
        phoneE164: true,
        role: true
      }
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    if (user.role === UserRole.SUPERADMIN) {
      throw new BadRequestException("SUPERADMIN users cannot be deleted")
    }

    const result = await this.deleteUsersService.deleteSelectedUsers([user], {
      replacementUserId,
      businessId: user.businessId
    })

    return {
      id: user.id,
      ...result
    }
  }
}
