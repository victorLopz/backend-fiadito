import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("debt_payments")
@Index("idx_debt_payments_debt_paid_at", ["debtId", "paidAt"])
@Index("idx_debt_payments_business_paid_at", ["businessId", "paidAt"])
export class DebtPaymentTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column("uuid", { name: "debt_id" })
  debtId!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string

  @CreateDateColumn({ type: "timestamptz", name: "paid_at" })
  paidAt!: Date

  @Column("uuid", { name: "received_by", nullable: true })
  receivedBy!: string | null

  @Column({ type: "varchar", length: 200, nullable: true })
  note!: string | null

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
