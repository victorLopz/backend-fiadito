import { BadRequestException } from "@nestjs/common"

export class ClientReference {
  private constructor(private readonly value: string) {}

  static create(raw: string): ClientReference {
    const normalized = raw?.trim()
    if (!normalized) {
      throw new BadRequestException("clientReference is required")
    }

    if (normalized.length > 80) {
      throw new BadRequestException("clientReference must be at most 80 characters")
    }

    return new ClientReference(normalized)
  }

  toString(): string {
    return this.value
  }
}
