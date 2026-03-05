export class Customer {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly name: string,
    public readonly whatsappE164: string | null,
    public readonly notes: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
