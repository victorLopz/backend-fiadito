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

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column("uuid", { name: "sale_id" })
  saleId!: string

  @Column("uuid", { name: "client_id" })
  clientId!: string

  @Column({ type: "numeric", precision: 14, scale: 2, name: "total_due" })
  totalDue!: string

  @Column({ type: "numeric", precision: 14, scale: 2, name: "balance" })
  balance!: string

  @Column({ type: "enum", enum: DebtStatus, default: DebtStatus.OPEN })
  status!: DebtStatus

  @Column({ type: "date", name: "due_date" })
  dueDate!: string

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
