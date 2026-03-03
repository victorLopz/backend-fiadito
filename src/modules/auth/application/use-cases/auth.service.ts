import * as argon2 from "argon2";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService {
  // OTP must be hashed and persisted with expiration, attempts and consumed_at.
  async requestOtp(destination: string, purpose: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await argon2.hash(code);
    void { destination, purpose, codeHash };
  }

  async verifyOtp(
    destination: string,
    code: string,
    purpose: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    void { destination, code, purpose };
    return {
      accessToken: "access.placeholder",
      refreshToken: "refresh.placeholder"
    };
  }

  async loginWithPassword(
    identifier: string,
    password: string
  ): Promise<{ requiresOtp: boolean }> {
    if (!identifier || !password) throw new UnauthorizedException();
    return { requiresOtp: false };
  }

  async refreshToken(
    rotationToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Rotation: revoke previous hashed refresh token and issue a new one.
    void rotationToken;
    return { accessToken: "access.rotated", refreshToken: "refresh.rotated" };
  }
}
