import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("debt_payments")
@Index(["businessId", "debtId", "createdAt"])
export class DebtPaymentTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column("uuid")
  debtId!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  amount!: string

  @Column("uuid")
  userId!: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
