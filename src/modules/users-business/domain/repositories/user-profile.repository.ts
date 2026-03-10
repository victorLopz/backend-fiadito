import { UserProfile } from "../entities/user-profile.entity"

export const USER_PROFILE_REPOSITORY = Symbol("USER_PROFILE_REPOSITORY")

export interface UserProfileRepository {
  findByIdAndBusiness(id: string, businessId: string): Promise<UserProfile | null>
  update(id: string, businessId: string, input: {
    fullName?: string
    email?: string
    phoneE164?: string
  }): Promise<void>
}
