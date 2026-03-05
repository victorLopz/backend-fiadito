import { BadRequestException } from "@nestjs/common"

export class Tax {
  private constructor(
    private readonly code: string,
    private readonly rate: number
  ) {}

  static create(input: { code: string; rate: number }): Tax {
    const code = input.code?.trim().toUpperCase()
    if (!code) {
      throw new BadRequestException("tax.code is required")
    }

    if (!Number.isFinite(input.rate) || input.rate < 0 || input.rate > 1) {
      throw new BadRequestException("tax.rate must be a number between 0 and 1")
    }

    return new Tax(code, input.rate)
  }

  getCode(): string {
    return this.code
  }

  getRate(): number {
    return this.rate
  }
}
