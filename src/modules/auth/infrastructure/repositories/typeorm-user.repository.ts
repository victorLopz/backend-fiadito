import { Injectable } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { UserRepository } from "src/modules/auth/domain/repositories/user.repository"
import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repository: Repository<UserTypeOrmEntity>
  ) {}

  async existsByPhone(phone: string): Promise<boolean> {
    const user = await this.repository.findOne({ where: { phoneE164: phone } })
    return !!user
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.repository.findOne({ where: { email } })
    return !!user
  }

  async create(input: {
    id: string
    businessId: string
    fullName: string
    email?: string
    phone?: string
    passwordHash: string
    role: UserRole
  }): Promise<UserTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        id: input.id,
        businessId: input.businessId,
        fullName: input.fullName,
        email: input.email,
        phoneE164: input.phone,
        passwordHash: input.passwordHash,
        isActive: true,
        ...(input.role && { role: input.role })
      })
    )
  }

  async findActiveByPhone(phone: string): Promise<UserTypeOrmEntity | null> {
    return this.repository.findOne({
      where: { phoneE164: phone, isActive: true }
    })
  }

  async findActiveByIdAndBusiness(
    id: string,
    businessId: string
  ): Promise<UserTypeOrmEntity | null> {
    return this.repository.findOne({
      where: { id, businessId, isActive: true }
    })
  }
}
