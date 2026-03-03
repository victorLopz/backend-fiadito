import { createCipheriv, randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';

type SessionResponse = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  };
};

@Injectable()
export class AuthService {
  private readonly otpRegex = /^\+[1-9]\d{6,14}$/;

  // OTP first auth flow: request code by mobile SMS and persist only its hash.
  async requestOtp(destinationMobile: string, purpose: string): Promise<void> {
    if (!this.otpRegex.test(destinationMobile)) {
      throw new UnauthorizedException('destinationMobile must be E.164');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await argon2.hash(code);

    // Persist OTP hash + expiresAt + attempts + consumedAt through OtpRepository (pending concrete infra repository).
    void { destinationMobile, purpose, codeHash };

    const encryptedPayload = this.encryptOtpForSms(code, destinationMobile);
    this.sendOtpSmsEncrypted(destinationMobile, encryptedPayload);
  }

  async verifyOtp(destinationMobile: string, code: string, purpose: string): Promise<SessionResponse> {
    // Validate hash, attempts and expiration/consumed state in OTP repository (pending infra implementation).
    void { destinationMobile, code, purpose };

    // Return authenticated session after successful OTP verification.
    return {
      session: {
        accessToken: 'access.placeholder',
        refreshToken: 'refresh.placeholder',
        expiresIn: 900,
        tokenType: 'Bearer',
      },
    };
  }

  // Login only requests phone number and sends OTP code directly to mobile SMS.
  async loginWithPhone(destinationMobile: string): Promise<{ requiresOtp: boolean }> {
    await this.requestOtp(destinationMobile, 'LOGIN');
    return { requiresOtp: true };
  }

  async refreshToken(rotationToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Rotation: revoke previous hashed refresh token and issue a new one.
    void rotationToken;
    return { accessToken: 'access.rotated', refreshToken: 'refresh.rotated' };
  }

  private encryptOtpForSms(code: string, destinationMobile: string): string {
    const iv = randomBytes(16);
    const key = randomBytes(32); // placeholder key management, replace with KMS/secret material.
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const payload = JSON.stringify({ code, destinationMobile, ts: Date.now() });

    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}.${encrypted.toString('hex')}`;
  }

  private sendOtpSmsEncrypted(destinationMobile: string, encryptedPayload: string): void {
    // TODO: implement direct mobile SMS delivery provider integration.
    void { destinationMobile, encryptedPayload };
  }
}
