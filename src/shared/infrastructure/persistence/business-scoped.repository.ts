import { FindOptionsWhere, Repository } from "typeorm"

export abstract class BusinessScopedRepository<T extends { businessId: string }> {
  constructor(protected readonly repo: Repository<T>) {}

  protected scopedWhere(businessId: string, where: FindOptionsWhere<T>): FindOptionsWhere<T> {
    return { ...where, businessId } as FindOptionsWhere<T>
  }
}
