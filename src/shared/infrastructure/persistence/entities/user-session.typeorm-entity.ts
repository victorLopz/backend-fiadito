import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("user_sessions")
@Index(["businessId", "userId"])
export class UserSessionTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid", name: "business_id" })
  businessId!: string

  @Column({ type: "uuid", name: "user_id" })
  userId!: string

  @Column({ nullable: true, name: "ip_address" })
  ipAddress?: string

  @Column({ nullable: true, name: "user_agent" })
  userAgent?: string

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @Column({ type: "timestamptz", nullable: true, name: "revoked_at" })
  revokedAt?: Date
}
