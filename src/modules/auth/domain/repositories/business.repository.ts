export const BUSINESS_REPOSITORY = Symbol("BUSINESS_REPOSITORY")

export type BusinessSummary = {
  id: string
  name: string
  isActive: boolean
}

export interface BusinessRepository {
  existsByName(name: string): Promise<boolean>
  create(input: { id: string; name: string }): Promise<BusinessSummary>
  findById(id: string): Promise<BusinessSummary | null>
}
