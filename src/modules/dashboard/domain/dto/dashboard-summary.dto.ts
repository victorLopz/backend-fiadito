export class DashboardSummaryDto {
  constructor(
    readonly totalSales: number,
    readonly totalRevenue: number,
    readonly totalClients: number,
    readonly pendingInvoices: number,
    readonly accountsReceivableTotal: number
  ) {}
}
