export class AccountsReceivableDto {
  constructor(
    readonly clientName: string,
    readonly invoiceNumber: string,
    readonly amount: number,
    readonly dueDate: Date
  ) {}
}
