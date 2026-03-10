export const DASHBOARD_REPOSITORY = Symbol("DASHBOARD_REPOSITORY")

export interface DashboardSummaryProjection {
  totalSales: number
  totalRevenue: number
  totalClients: number
  pendingInvoices: number
  accountsReceivableTotal: number
}

export interface WeeklySalesProjection {
  date: string
  sales: number
  revenue: number
}

export interface AccountsReceivableProjection {
  clientName: string
  invoiceNumber: string
  amount: number
  dueDate: Date
}

export interface IDashboardRepository {
  getSummary(businessId: string): Promise<DashboardSummaryProjection>
  getWeeklySales(businessId: string, referenceDate?: Date): Promise<WeeklySalesProjection[]>
  getAccountsReceivable(businessId: string): Promise<AccountsReceivableProjection[]>
}
