export interface OtpRepository {
  createOtp(input: {
    businessId?: string;
    destination: string;
    purpose: string;
    codeHash: string;
    expiresAt: Date;
  }): Promise<void>;
  getActiveOtp(destination: string, purpose: string): Promise<Record<string, unknown> | null>;
  consumeOtp(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
}
