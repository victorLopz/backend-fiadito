export class Customer {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly nombre: string | null,
    public readonly telefonoWhatsApp: string,
    public readonly consentimientoVoucher: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
