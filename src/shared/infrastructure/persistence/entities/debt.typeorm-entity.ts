import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import { DebtStatus } from "./enums"

@Entity("debts")
@Index(["businessId", "status"])
export class DebtTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column("uuid")
  saleId!: string

  @Column("uuid")
  clientId!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  totalAmount!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  paidAmount!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  balance!: string

  @Column({ type: "enum", enum: DebtStatus, default: DebtStatus.OPEN })
  status!: DebtStatus

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
