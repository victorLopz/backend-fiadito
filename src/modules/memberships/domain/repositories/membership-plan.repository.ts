import { MembershipPlanCode } from "src/shared/infrastructure/persistence/entities/enums"
import { PlanTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/plan.typeorm-entity"

export const MEMBERSHIP_PLAN_REPOSITORY = Symbol("MEMBERSHIP_PLAN_REPOSITORY")

export interface MembershipPlanRepository {
  findActivePlans(): Promise<PlanTypeOrmEntity[]>
  findByCode(code: MembershipPlanCode): Promise<PlanTypeOrmEntity | null>
  findById(id: string): Promise<PlanTypeOrmEntity | null>
}
