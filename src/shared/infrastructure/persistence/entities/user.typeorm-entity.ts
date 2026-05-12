import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn
} from "typeorm"
import { BusinessTypeOrmEntity } from "./business.typeorm-entity"
import { UserRole } from "./enums"

@Entity("users")
@Index(["businessId", "email"], { unique: true })
@Index(["businessId", "phoneE164"], { unique: true })
export class UserTypeOrmEntity {
  /* ================================
     PRIMARY KEY
  ================================= */
  @PrimaryGeneratedColumn("uuid")
  id!: string

  /* ================================
     RELATIONSHIP (TENANT / BUSINESS)
  ================================= */
  @Column({ type: "uuid", name: "business_id" })
  businessId!: string

  @ManyToOne(() => BusinessTypeOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business!: BusinessTypeOrmEntity

  /* ================================
     BASIC INFORMATION
  ================================= */
  @Column({ name: "full_name", type: "varchar" })
  fullName!: string

  @Column({ type: "varchar", nullable: true })
  email?: string

  @Column({ name: "phone_e164", type: "varchar", nullable: true })
  phoneE164?: string

  @Column({
    name: "password_hash",
    type: "text",
    nullable: true // solo cuando provider = LOCAL
  })
  passwordHash?: string

  /* ================================
     VERIFICATION
  ================================= */
  @Column({
    name: "email_verified_at",
    type: "timestamptz",
    nullable: true
  })
  emailVerifiedAt?: Date

  @Column({
    name: "phone_verified_at",
    type: "timestamptz",
    nullable: true
  })
  phoneVerifiedAt?: Date

  /* ================================
     SECURITY
  ================================= */
  @Column({
    name: "failed_login_attempts",
    type: "int",
    default: 0
  })
  failedLoginAttempts!: number

  @Column({
    name: "locked_until",
    type: "timestamptz",
    nullable: true
  })
  lockedUntil?: Date

  @Column({
    name: "last_login_at",
    type: "timestamptz",
    nullable: true
  })
  lastLoginAt?: Date

  /* ================================
     STATUS
  ================================= */
  @Column({
    type: "enum",
    enum: UserRole,
    enumName: "users_role_enum",
    default: UserRole.CASHIER
  })
  role!: UserRole

  @Column({
    name: "is_active",
    type: "boolean",
    default: true
  })
  isActive!: boolean

  /* ================================
     AUDIT
  ================================= */
  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz"
  })
  createdAt!: Date

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz"
  })
  updatedAt!: Date
}
