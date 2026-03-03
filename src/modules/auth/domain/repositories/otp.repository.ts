import { OtpPurpose } from 'src/shared/infrastructure/persistence/entities/enums';
import { OtpCodeTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/otp-code.typeorm-entity';

export const OTP_REPOSITORY = Symbol('OTP_REPOSITORY');

export interface OtpRepository {
  invalidateActiveOtps(destination: string, purpose: OtpPurpose): Promise<void>;
  createOtp(input: { destination: string; purpose: OtpPurpose; codeHash: string; expiresAt: Date }): Promise<void>;
  getLatestActiveOtp(destination: string, purpose: OtpPurpose): Promise<OtpCodeTypeOrmEntity | null>;
  consumeOtp(id: string): Promise<void>;
  incrementAttempts(id: string, attempts: number): Promise<void>;
}
