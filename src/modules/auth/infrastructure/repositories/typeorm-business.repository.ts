import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessRepository } from "src/modules/auth/domain/repositories/business.repository";
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

  async create(input: {
    id: string;
    name: string;
  }): Promise<{ id: string; name: string }> {
    const business = await this.repository.save(
      this.repository.create({
        id: input.id,
        legalName: input.name,
        isActive: true
      })
    );

    return { id: business.id, name: business.legalName };
  }
}
