import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {
  BusinessRepository,
  BusinessSummary
} from "src/modules/auth/domain/repositories/business.repository";
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity";

@Injectable()
export class TypeOrmBusinessRepository implements BusinessRepository {
  constructor(
    @InjectRepository(BusinessTypeOrmEntity)
    private readonly repository: Repository<BusinessTypeOrmEntity>
  ) {}

  async existsByName(name: string): Promise<boolean> {
    const business = await this.repository.findOne({
      where: { legalName: name }
    });
    return !!business;
  }

  async create(input: { id: string; name: string }): Promise<BusinessSummary> {
    const business = await this.repository.save(
      this.repository.create({
        id: input.id,
        legalName: input.name,
        isActive: true
      })
    );

    return {
      id: business.id,
      name: business.legalName,
      isActive: business.isActive
    };
  }

  async findById(id: string): Promise<BusinessSummary | null> {
    const business = await this.repository.findOne({ where: { id } });
    if (!business) {
      return null;
    }

    return {
      id: business.id,
      name: business.legalName,
      isActive: business.isActive
    };
  }
}
