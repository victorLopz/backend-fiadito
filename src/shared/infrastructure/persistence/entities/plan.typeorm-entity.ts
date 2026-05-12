import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { MembershipPlanCode } from "./enums"

@Entity("plans")
export class PlanTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "enum", enum: MembershipPlanCode, enumName: "plan_code", unique: true })
  code!: MembershipPlanCode

  @Column({ length: 80 })
  name!: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ type: "int", name: "product_limit", nullable: true })
  productLimit?: number | null

  @Column({ type: "int", name: "customer_limit", nullable: true })
  customerLimit?: number | null

  @Column({ type: "int", name: "sales_history_days_limit", nullable: true })
  historyDays?: number | null

  @Column({ type: "boolean", name: "allow_product_images", default: false })
  allowProductImages!: boolean

  @Column({ type: "numeric", precision: 12, scale: 2, name: "price_monthly", default: 0 })
  monthlyPrice!: string

  @Column({ length: 3, name: "currency_code", default: "USD" })
  currencyCode!: string

  @Column({ type: "int", name: "billing_period_days", default: 30 })
  billingPeriodDays!: number

  @Column({ type: "int", name: "grace_period_days", default: 3 })
  gracePeriodDays!: number

  @Column({ name: "is_active", default: true })
  isActive!: boolean

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
