import { UserRole } from "src/shared/infrastructure/persistence/entities/enums";
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  existsByPhone(phone: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  create(input: {
    id: string;
    businessId: string;
    fullName: string;
    email?: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<UserTypeOrmEntity>;
  findActiveByPhone(phone: string): Promise<UserTypeOrmEntity | null>;
  findActiveByIdAndBusiness(
    id: string,
    businessId: string
  ): Promise<UserTypeOrmEntity | null>;
}
