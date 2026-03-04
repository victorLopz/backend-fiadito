import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { InvoiceTypeOrmEntity } from "./invoice.typeorm-entity"

@Entity("invoice_items")
export class InvoiceItemTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  invoiceId!: string

  @ManyToOne(() => InvoiceTypeOrmEntity, (invoice) => invoice.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoiceId" })
  invoice!: InvoiceTypeOrmEntity

  @Column({ type: "uuid" })
  saleItemId!: string

  @Column({ type: "varchar", length: 160 })
  description!: string

  @Column({ type: "numeric", precision: 12, scale: 4 })
  quantity!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  unitPrice!: string

  @Column({ type: "varchar", length: 20 })
  taxCode!: string

  @Column({ type: "numeric", precision: 5, scale: 4 })
  taxRate!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  subtotal!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  taxAmount!: string

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total!: string
}
