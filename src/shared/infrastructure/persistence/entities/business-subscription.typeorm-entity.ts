import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import { MembershipSubscriptionStatus } from "./enums"
import { BusinessTypeOrmEntity } from "./business.typeorm-entity"
import { PlanTypeOrmEntity } from "./plan.typeorm-entity"

@Entity("business_subscriptions")
@Index(["businessId", "status"])
export class BusinessSubscriptionTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid", name: "business_id" })
  businessId!: string

  @ManyToOne(() => BusinessTypeOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business!: BusinessTypeOrmEntity

  @Column({ type: "uuid", name: "plan_id" })
  planId!: string

  @ManyToOne(() => PlanTypeOrmEntity)
  @JoinColumn({ name: "plan_id" })
  plan!: PlanTypeOrmEntity

  @Column({
    type: "enum",
    enum: MembershipSubscriptionStatus,
    enumName: "subscription_status",
    default: MembershipSubscriptionStatus.ACTIVE
  })
  status!: MembershipSubscriptionStatus

  @Column({ type: "timestamptz", name: "started_at", default: () => "now()" })
  startsAt!: Date

  @Column({ type: "timestamptz", name: "current_period_start", nullable: true })
  currentPeriodStart?: Date

  @Column({ type: "timestamptz", name: "current_period_end", nullable: true })
  currentPeriodEnd?: Date

  @Column({ type: "timestamptz", name: "grace_period_ends_at", nullable: true })
  gracePeriodEndsAt?: Date

  @Column({ type: "timestamptz", name: "cancelled_at", nullable: true })
  cancelledAt?: Date

  @Column({ type: "timestamptz", name: "last_payment_at", nullable: true })
  lastRenewedAt?: Date

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
