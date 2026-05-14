import { IsOptional, IsUUID } from "class-validator"

export class DeleteUsersQueryDto {
  @IsOptional()
  @IsUUID()
  businessId?: string
}
