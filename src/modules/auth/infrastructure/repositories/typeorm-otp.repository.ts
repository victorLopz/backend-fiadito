import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OtpRepository } from 'src/modules/auth/domain/repositories/otp.repository';
import { OtpPurpose } from 'src/shared/infrastructure/persistence/entities/enums';
import { OtpCodeTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/otp-code.typeorm-entity';

@Injectable()
export class TypeOrmOtpRepository implements OtpRepository {
  constructor(
    @InjectRepository(OtpCodeTypeOrmEntity)
    private readonly repository: Repository<OtpCodeTypeOrmEntity>,
  ) {}

  async invalidateActiveOtps(destination: string, purpose: OtpPurpose): Promise<void> {
    await this.repository.update(
      {
        destination,
        purpose,
        consumedAt: IsNull(),
      },
      { consumedAt: new Date() },
    );
  }

  async createOtp(input: { destination: string; purpose: OtpPurpose; codeHash: string; expiresAt: Date }): Promise<void> {
    await this.repository.save(
      this.repository.create({
        destination: input.destination,
        purpose: input.purpose,
        codeHash: input.codeHash,
        attempts: 0,
        expiresAt: input.expiresAt,
      }),
    );
  }

  async getLatestActiveOtp(destination: string, purpose: OtpPurpose): Promise<OtpCodeTypeOrmEntity | null> {
    return this.repository.findOne({
      where: {
        destination,
        purpose,
        consumedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async consumeOtp(id: string): Promise<void> {
    await this.repository.update({ id }, { consumedAt: new Date() });
  }

  async incrementAttempts(id: string, attempts: number): Promise<void> {
    await this.repository.update({ id }, { attempts });
  }
}
