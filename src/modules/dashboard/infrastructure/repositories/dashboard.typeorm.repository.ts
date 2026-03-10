import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {
  AccountsReceivableProjection,
  DashboardSummaryProjection,
  IDashboardRepository,
  WeeklySalesProjection
} from "src/modules/dashboard/domain/repositories/dashboard.repository"
import { DebtStatus } from "src/shared/infrastructure/persistence/entities/enums"
import { ClientTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/client.typeorm-entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { In, MoreThanOrEqual, Repository } from "typeorm"

@Injectable()
export class DashboardTypeOrmRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(SaleTypeOrmEntity)
    private readonly salesRepository: Repository<SaleTypeOrmEntity>,
    @InjectRepository(DebtTypeOrmEntity)
    private readonly debtsRepository: Repository<DebtTypeOrmEntity>,
    @InjectRepository(CustomerTypeOrmEntity)
    private readonly customersRepository: Repository<CustomerTypeOrmEntity>,
    @InjectRepository(ClientTypeOrmEntity)
    private readonly clientsRepository: Repository<ClientTypeOrmEntity>
  ) {}

  async getSummary(businessId: string): Promise<DashboardSummaryProjection> {
    const todayStart = this.startOfUtcDay(new Date())
    const tomorrowStart = this.addUtcDays(todayStart, 1)

    const [todaySales, totalClients, pendingDebts] = await Promise.all([
      this.salesRepository.find({
        where: {
          businessId,
          createdAt: MoreThanOrEqual(todayStart)
        }
      }),
      this.customersRepository.count({ where: { businessId } }),
      this.debtsRepository.find({
        where: {
          businessId,
          status: In([DebtStatus.OPEN])
        }
      })
    ])

    const sales = todaySales.filter((sale) => sale.createdAt < tomorrowStart)
    const totalSales = sales.length
    const totalRevenue = this.sumMoney(sales.map((sale) => sale.total))
    const pendingInvoices = pendingDebts.filter(
      (debt) => debt.createdAt >= todayStart && debt.createdAt < tomorrowStart
    ).length
    const accountsReceivableTotal = this.sumMoney(pendingDebts.map((debt) => debt.balance))

    return {
      totalSales,
      totalRevenue,
      totalClients,
      pendingInvoices,
      accountsReceivableTotal
    }
  }

  async getWeeklySales(businessId: string, referenceDate = new Date()): Promise<WeeklySalesProjection[]> {
    const endDate = this.endOfUtcDay(referenceDate)
    const startDate = this.startOfUtcDay(new Date(Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate() - 6
    )))

    const sales = await this.salesRepository.find({
      where: {
        businessId,
        createdAt: MoreThanOrEqual(startDate)
      },
      order: { createdAt: "ASC" }
    })

    const salesByDate = new Map<string, { sales: number; revenue: number }>()
    for (let cursor = new Date(startDate); cursor <= endDate; cursor = this.addUtcDays(cursor, 1)) {
      salesByDate.set(this.toUtcDateKey(cursor), { sales: 0, revenue: 0 })
    }

    for (const sale of sales) {
      if (sale.createdAt > endDate) {
        continue
      }

      const dateKey = this.toUtcDateKey(sale.createdAt)
      const current = salesByDate.get(dateKey)
      if (!current) {
        continue
      }

      current.sales += 1
      current.revenue = this.roundMoney(current.revenue + Number(sale.total))
    }

    return Array.from(salesByDate.entries()).map(([date, totals]) => ({
      date,
      sales: totals.sales,
      revenue: totals.revenue
    }))
  }

  async getAccountsReceivable(businessId: string): Promise<AccountsReceivableProjection[]> {
    const debts = await this.debtsRepository.find({
      where: {
        businessId,
        status: In([DebtStatus.OPEN])
      },
      order: { createdAt: "DESC" }
    })

    const saleIds = [...new Set(debts.map((debt) => debt.saleId))]
    const clientIds = [...new Set(debts.map((debt) => debt.clientId))]

    const [sales, customers, clients] = await Promise.all([
      saleIds.length > 0
        ? this.salesRepository.find({
            where: {
              businessId,
              id: In(saleIds)
            }
          })
        : [],
      clientIds.length > 0
        ? this.customersRepository.find({
            where: {
              businessId,
              id: In(clientIds)
            }
          })
        : [],
      clientIds.length > 0
        ? this.clientsRepository.find({
            where: {
              businessId,
              id: In(clientIds)
            }
          })
        : []
    ])

    const invoiceNumberBySaleId = new Map(
      sales.map((sale) => [sale.id, sale.receiptNumber ?? `SALE-${sale.id.slice(0, 8)}`])
    )
    const customerNameById = new Map(customers.map((customer) => [customer.id, customer.name]))
    const clientNameById = new Map(clients.map((client) => [client.id, client.fullName]))

    return debts.map((debt) => ({
      clientName:
        customerNameById.get(debt.clientId) ??
        clientNameById.get(debt.clientId) ??
        "Cliente sin nombre",
      invoiceNumber: invoiceNumberBySaleId.get(debt.saleId) ?? `DEBT-${debt.id.slice(0, 8)}`,
      amount: Number(debt.balance),
      dueDate: new Date(`${debt.dueDate}T00:00:00.000Z`)
    }))
  }

  private sumMoney(values: string[]): number {
    return this.roundMoney(values.reduce((total, value) => total + Number(value), 0))
  }

  private roundMoney(value: number): number {
    return Number(value.toFixed(2))
  }

  private startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  }

  private endOfUtcDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
    )
  }

  private addUtcDays(date: Date, days: number): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days)
    )
  }

  private toUtcDateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
  }
}
