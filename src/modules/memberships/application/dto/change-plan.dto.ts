import { IsEnum } from "class-validator"
import { MembershipPlanCode } from "src/shared/infrastructure/persistence/entities/enums"

export class ChangePlanDto {
  @IsEnum(MembershipPlanCode)
  planCode!: MembershipPlanCode
}
