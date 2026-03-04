import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("whatsapp_message_logs")
@Index(["businessId", "destination", "createdAt"])
export class WhatsappMessageLogTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column()
  destination!: string

  @Column()
  templateCode!: string

  @Column({ default: "PENDING" })
  status!: string

  @Column({ type: "jsonb", nullable: true })
  payload?: Record<string, unknown>

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
