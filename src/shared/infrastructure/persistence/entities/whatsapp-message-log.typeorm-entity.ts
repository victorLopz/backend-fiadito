import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { WhatsappMessageType } from "./enums"

@Entity("whatsapp_message_logs")
@Index("idx_wa_logs_business_created", ["businessId", "createdAt"])
@Index("idx_wa_logs_to_created", ["toPhoneE164", "createdAt"])
export class WhatsappMessageLogTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column({
    type: "enum",
    enum: WhatsappMessageType,
    enumName: "whatsapp_message_type"
  })
  type!: WhatsappMessageType

  @Column("uuid", { name: "client_id", nullable: true })
  clientId!: string | null

  @Column("uuid", { name: "sale_id", nullable: true })
  saleId!: string | null

  @Column("uuid", { name: "debt_id", nullable: true })
  debtId!: string | null

  @Column({ type: "varchar", length: 20, name: "to_phone_e164" })
  toPhoneE164!: string

  @Column({ type: "text", name: "message_text" })
  messageText!: string

  @Column({ default: "CREATED" })
  status!: string

  @Column({ type: "text", name: "media_url", nullable: true })
  mediaUrl?: string | null

  @Column({ type: "varchar", length: 40, nullable: true })
  provider?: string | null

  @Column({ type: "varchar", length: 120, name: "provider_message_id", nullable: true })
  providerMessageId?: string | null

  @Column({ type: "text", name: "error_message", nullable: true })
  errorMessage?: string | null

  @Column("uuid", { name: "created_by", nullable: true })
  createdBy?: string | null

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
