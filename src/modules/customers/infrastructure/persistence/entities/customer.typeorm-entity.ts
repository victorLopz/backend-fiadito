import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from "typeorm"

@Entity("customers")
@Index(["telefonoWhatsApp"])
export class CustomerTypeOrmEntity {
  @PrimaryColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 120, nullable: true })
  nombre!: string | null

  @Column({ type: "varchar", length: 30 })
  telefonoWhatsApp!: string

  @Column({ type: "boolean" })
  consentimientoVoucher!: boolean

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
