import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm"

@Entity("customers")
@Index(["businessId", "name"])
@Index(["businessId", "whatsappE164"])
export class CustomerTypeOrmEntity {
  @PrimaryColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column({ type: "varchar", length: 120, name: "name" })
  name!: string

  @Column({ type: "varchar", length: 30, nullable: true, name: "whatsapp_e164" })
  whatsappE164!: string | null

  @Column({ type: "varchar", length: 500, nullable: true, name: "notes" })
  notes!: string | null

  @Column({ type: "boolean", name: "is_active" })
  isActive!: boolean

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
