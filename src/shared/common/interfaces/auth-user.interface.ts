import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"

export interface AuthUser {
  id?: string
  businessId: string
  role?: UserRole
  iat?: number
  exp?: number
  fullName?: string
  email?: string
  phone?: string
}
