import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { DataSource, In } from "typeorm"
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { DebtPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt-payment.typeorm-entity"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { WhatsappMessageLogTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/whatsapp-message-log.typeorm-entity"
import { DebtStatus, WhatsappMessageType } from "src/shared/infrastructure/persistence/entities/enums"

@Injectable()
export class DebtsService {
  constructor(private readonly dataSource: DataSource) {}

  async addPayment(debtId: string, amount: number, userId?: string): Promise<void> {
    if (!debtId) {
      throw new BadRequestException("debtId is required")
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("amount must be > 0")
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const debtRepo = queryRunner.manager.getRepository(DebtTypeOrmEntity)
      const paymentRepo = queryRunner.manager.getRepository(DebtPaymentTypeOrmEntity)
      const saleRepo = queryRunner.manager.getRepository(SaleTypeOrmEntity)

      const debt = await debtRepo.findOne({ where: { id: debtId } })
      if (!debt) {
        throw new NotFoundException("Debt not found")
      }

      if (debt.status === DebtStatus.PAID || Number(debt.balance) <= 0) {
        throw new BadRequestException("Debt is already fully paid")
      }

      const sale = await saleRepo.findOne({ where: { id: debt.saleId } })
      const paymentUserId = userId ?? sale?.createdBy
      if (!paymentUserId) {
        throw new BadRequestException("userId is required to register payment")
      }

      await paymentRepo.save(
        paymentRepo.create({
          businessId: debt.businessId,
          debtId: debt.id,
          amount: this.toMoney(amount),
          receivedBy: paymentUserId
        })
      )

      const nextBalance = Math.max(0, Number(debt.balance) - amount)
      const nextStatus = nextBalance === 0 ? DebtStatus.PAID : DebtStatus.OPEN

      await debtRepo.update(
        { id: debt.id },
        {
          balance: this.toMoney(nextBalance),
          status: nextStatus
        }
      )

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async listOpenDebts(filters: Record<string, unknown>): Promise<{
    data: Record<string, unknown>[]
    page: number
    limit: number
    total: number
    totalPages: number
  }> {
    const businessId = typeof filters.businessId === "string" ? filters.businessId : ""
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const page = this.parsePositiveInt(filters.page, 1)
    const limit = this.parsePositiveInt(filters.limit, 20)

    const debtRepo = this.dataSource.getRepository(DebtTypeOrmEntity)
    const [debts, total] = await debtRepo.findAndCount({
      where: {
        businessId,
        status: In([DebtStatus.OPEN])
      },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit
    })

    const saleIds = [...new Set(debts.map((debt) => debt.saleId))]
    const clientIds = [...new Set(debts.map((debt) => debt.clientId))]
    const businessIds = [...new Set(debts.map((debt) => debt.businessId))]

    const saleRepo = this.dataSource.getRepository(SaleTypeOrmEntity)
    const customerRepo = this.dataSource.getRepository(CustomerTypeOrmEntity)
    const businessRepo = this.dataSource.getRepository(BusinessTypeOrmEntity)

    const [sales, customers, businesses] = await Promise.all([
      saleIds.length > 0
        ? saleRepo.find({
            where: { businessId, id: In(saleIds) }
          })
        : [],
      clientIds.length > 0
        ? customerRepo.find({
            where: { businessId, id: In(clientIds) }
          })
        : [],
      businessIds.length > 0
        ? businessRepo.find({
            where: { id: In(businessIds) }
          })
        : []
    ])

    const saleReferenceById = new Map(
      sales.map((sale) => [sale.id, sale.receiptNumber ?? `SALE-${sale.id.slice(0, 8)}`])
    )
    const customerNameById = new Map(customers.map((customer) => [customer.id, customer.name]))
    const businessNameById = new Map(
      businesses.map((business) => [business.id, business.legalName])
    )

    return {
      data: debts.map((debt) => ({
        id: debt.id,
        debtReference: `DEBT-${debt.id.slice(0, 8)}`,
        businessId: debt.businessId,
        businessName: businessNameById.get(debt.businessId) ?? "Negocio sin nombre",
        saleId: debt.saleId,
        saleReference: saleReferenceById.get(debt.saleId) ?? `SALE-${debt.saleId.slice(0, 8)}`,
        clientId: debt.clientId,
        clientName: customerNameById.get(debt.clientId) ?? "Cliente sin nombre",
        totalDue: Number(debt.totalDue),
        paidAmount: Number(debt.totalDue) - Number(debt.balance),
        balance: Number(debt.balance),
        status: debt.status,
        dueDate: debt.dueDate,
        createdAt: debt.createdAt,
        updatedAt: debt.updatedAt
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  async sendDebtReminder(debtId: string, createdBy?: string): Promise<void> {
    const debtRepo = this.dataSource.getRepository(DebtTypeOrmEntity)
    const customerRepo = this.dataSource.getRepository(CustomerTypeOrmEntity)
    const logRepo = this.dataSource.getRepository(WhatsappMessageLogTypeOrmEntity)

    const debt = await debtRepo.findOne({ where: { id: debtId } })
    if (!debt) {
      throw new NotFoundException("Debt not found")
    }

    const customer = await customerRepo.findOne({
      where: { id: debt.clientId, businessId: debt.businessId }
    })
    const clientName = customer?.name ?? "Cliente sin nombre"

    await logRepo.save(
      logRepo.create({
        businessId: debt.businessId,
        type: WhatsappMessageType.DEBT_REMINDER,
        clientId: debt.clientId,
        saleId: debt.saleId,
        debtId: debt.id,
        toPhoneE164: customer?.whatsappE164 ?? "UNKNOWN",
        messageText: `Hola ${clientName}, te recordamos que tienes un saldo pendiente de ${Number(debt.balance).toFixed(2)}. Referencia: DEBT-${debt.id.slice(0, 8)}.`,
        status: "CREATED",
        createdBy: createdBy ?? null
      })
    )
  }

  private toMoney(value: number): string {
    return value.toFixed(2)
  }

  private parsePositiveInt(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
      return value
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10)
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed
      }
    }

    return fallback
  }
}
