import { Injectable } from "@nestjs/common"
import { EntityManager } from "typeorm"
import {
  CreateDebtInput,
  IDebtRepository
} from "src/modules/debts/domain/repositories/debt.repository"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { DebtStatus } from "src/shared/infrastructure/persistence/entities/enums"

@Injectable()
export class TypeOrmDebtRepository implements IDebtRepository {
  async create(debt: CreateDebtInput, manager: EntityManager): Promise<void> {
    await manager.getRepository(DebtTypeOrmEntity).save(
      manager.getRepository(DebtTypeOrmEntity).create({
        id: debt.id,
        businessId: debt.businessId,
        saleId: debt.saleId,
        clientId: debt.clientId,
        totalDue: this.toMoney(debt.totalDue),
        balance: this.toMoney(debt.balance),
        status: DebtStatus.OPEN,
        dueDate: debt.dueDate
      })
    )
  }

  private toMoney(value: number): string {
    return value.toFixed(2)
  }
}
