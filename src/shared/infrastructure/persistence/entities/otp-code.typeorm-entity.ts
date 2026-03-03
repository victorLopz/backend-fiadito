import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { OtpPurpose } from "./enums";

@Entity("otp_codes")
@Index(["businessId", "destination", "purpose"])
export class OtpCodeTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid", { nullable: true, name: "business_id" })
  businessId?: string;

  @Column("uuid", { nullable: true, name: "user_id" })
  userId?: string;

  @Column()
  destination!: string;

  @Column({ type: "enum", enum: OtpPurpose })
  purpose!: OtpPurpose;

  @Column({ length: 255, name: "code_hash" })
  codeHash!: string;

  @Column({ default: 0 })
  attempts!: number;

  @Column({ nullable: true, name: "max_attempts" })
  maxAttempts?: number;

  @Column({ type: "timestamptz", name: "expires_at" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true, name: "consumed_at" })
  consumedAt?: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
