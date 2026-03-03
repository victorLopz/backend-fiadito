import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { TokenType } from "./enums";

@Entity("auth_tokens")
@Index(["businessId", "userId", "type"])
export class AuthTokenTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid", { nullable: true, name: "business_id" })
  businessId!: string;

  @Column("uuid", { name: "user_id" })
  userId!: string;

  @Column({ type: "enum", enum: TokenType })
  type!: TokenType;

  @Column({ type: "text", name: "token_hash" })
  tokenHash!: string;

  @Column({ type: "timestamptz", name: "expires_at" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true, name: "revoked_at" })
  revokedAt?: Date;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
