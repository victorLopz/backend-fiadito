import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm"

@Entity("customers")
@Index(["businessId", "telefonoWhatsApp"])
export class CustomerTypeOrmEntity {
  @PrimaryColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column({ type: "varchar", length: 120, nullable: true, name: "nombre" })
  nombre!: string | null

  @Column({ type: "varchar", length: 30, name: "telefono_whatsapp" })
  telefonoWhatsApp!: string

  @Column({ type: "boolean", name: "consentimiento_voucher" })
  consentimientoVoucher!: boolean

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
