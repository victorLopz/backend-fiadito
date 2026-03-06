import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { DataSource, In } from "typeorm"
import { ClientTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/client.typeorm-entity"
import { DebtPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt-payment.typeorm-entity"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { WhatsappMessageLogTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/whatsapp-message-log.typeorm-entity"
import { DebtStatus } from "src/shared/infrastructure/persistence/entities/enums"

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
          userId: paymentUserId
        })
      )

      const nextPaid = Number(debt.paidAmount) + amount
      const totalAmount = Number(debt.totalAmount)
      const nextBalance = Math.max(0, totalAmount - nextPaid)

      const nextStatus =
        nextBalance === 0 ? DebtStatus.PAID : nextPaid > 0 ? DebtStatus.PARTIAL : DebtStatus.OPEN

      await debtRepo.update(
        { id: debt.id },
        {
          paidAmount: this.toMoney(nextPaid),
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

  async listOpenDebts(filters: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    const businessId = typeof filters.businessId === "string" ? filters.businessId : ""
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const debtRepo = this.dataSource.getRepository(DebtTypeOrmEntity)
    const debts = await debtRepo.find({
      where: {
        businessId,
        status: In([DebtStatus.OPEN, DebtStatus.PARTIAL])
      },
      order: { createdAt: "DESC" }
    })

    return debts.map((debt) => ({
      id: debt.id,
      businessId: debt.businessId,
      saleId: debt.saleId,
      clientId: debt.clientId,
      totalAmount: Number(debt.totalAmount),
      paidAmount: Number(debt.paidAmount),
      balance: Number(debt.balance),
      status: debt.status,
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt
    }))
  }

  async sendDebtReminder(debtId: string): Promise<void> {
    const debtRepo = this.dataSource.getRepository(DebtTypeOrmEntity)
    const clientRepo = this.dataSource.getRepository(ClientTypeOrmEntity)
    const logRepo = this.dataSource.getRepository(WhatsappMessageLogTypeOrmEntity)

    const debt = await debtRepo.findOne({ where: { id: debtId } })
    if (!debt) {
      throw new NotFoundException("Debt not found")
    }

    const client = await clientRepo.findOne({
      where: { id: debt.clientId, businessId: debt.businessId }
    })

    await logRepo.save(
      logRepo.create({
        businessId: debt.businessId,
        destination: client?.phone ?? "UNKNOWN",
        templateCode: "DEBT_REMINDER",
        status: "PENDING",
        payload: {
          debtId: debt.id,
          clientId: debt.clientId,
          balance: Number(debt.balance)
        }
      })
    )
  }

  private toMoney(value: number): string {
    return value.toFixed(2)
  }
}
