import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import { InvoiceItemTypeOrmEntity } from "./invoice-item.typeorm-entity"

@Entity("invoices")
export class InvoiceTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  businessId!: string

  @Column({ type: "uuid" })
  saleId!: string

  @Column({ type: "varchar", length: 80 })
  clientReference!: string

  @Column({ type: "varchar", length: 3 })
  currency!: string

  @Column({ type: "timestamp" })
  issuedAt!: Date

  @Column({ type: "varchar", length: 20 })
  status!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  subtotal!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  taxTotal!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total!: string

  @OneToMany(() => InvoiceItemTypeOrmEntity, (item) => item.invoice, { cascade: true })
  items!: InvoiceItemTypeOrmEntity[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
