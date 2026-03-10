export class UserProfile {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly fullName: string,
    public readonly email: string | null,
    public readonly phoneE164: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
