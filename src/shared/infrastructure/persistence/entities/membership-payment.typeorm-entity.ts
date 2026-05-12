import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm"
import {
  MembershipPaymentMethod,
  MembershipPaymentStatus
} from "./enums"
import { BusinessSubscriptionTypeOrmEntity } from "./business-subscription.typeorm-entity"
import { BusinessTypeOrmEntity } from "./business.typeorm-entity"
import { PlanTypeOrmEntity } from "./plan.typeorm-entity"

@Entity("membership_payments")
@Index(["businessId", "paidAt"])
@Index(["subscriptionId", "paidAt"])
export class MembershipPaymentTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid", name: "business_id" })
  businessId!: string

  @ManyToOne(() => BusinessTypeOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business!: BusinessTypeOrmEntity

  @Column({ type: "uuid", name: "subscription_id" })
  subscriptionId!: string

  @ManyToOne(() => BusinessSubscriptionTypeOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subscription_id" })
  subscription!: BusinessSubscriptionTypeOrmEntity

  @Column({ type: "uuid", name: "plan_id" })
  planId!: string

  @ManyToOne(() => PlanTypeOrmEntity)
  @JoinColumn({ name: "plan_id" })
  plan!: PlanTypeOrmEntity

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string

  @Column({ length: 3, default: "USD" })
  currency!: string

  @Column({ type: "varchar", default: MembershipPaymentStatus.PAID })
  status!: MembershipPaymentStatus

  @Column({ type: "varchar", default: MembershipPaymentMethod.MANUAL })
  method!: MembershipPaymentMethod

  @Column({ name: "external_reference", nullable: true })
  externalReference?: string

  @Column({ type: "timestamptz", name: "paid_at", nullable: true })
  paidAt?: Date

  @Column({ type: "timestamptz", name: "period_start" })
  periodStart!: Date

  @Column({ type: "timestamptz", name: "period_end" })
  periodEnd!: Date

  @Column({ type: "uuid", name: "created_by", nullable: true })
  createdBy?: string

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
