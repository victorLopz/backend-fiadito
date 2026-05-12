import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { MembershipPlanRepository } from "src/modules/memberships/domain/repositories/membership-plan.repository"
import { MembershipPlanCode } from "src/shared/infrastructure/persistence/entities/enums"
import { PlanTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/plan.typeorm-entity"

@Injectable()
export class TypeOrmMembershipPlanRepository implements MembershipPlanRepository {
  constructor(
    @InjectRepository(PlanTypeOrmEntity)
    private readonly repository: Repository<PlanTypeOrmEntity>
  ) {}

  findActivePlans(): Promise<PlanTypeOrmEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", monthlyPrice: "ASC" }
    })
  }

  findByCode(code: MembershipPlanCode): Promise<PlanTypeOrmEntity | null> {
    return this.repository.findOne({ where: { code, isActive: true } })
  }

  findById(id: string): Promise<PlanTypeOrmEntity | null> {
    return this.repository.findOne({ where: { id, isActive: true } })
  }
}
