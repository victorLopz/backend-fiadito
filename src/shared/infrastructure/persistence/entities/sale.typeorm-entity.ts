import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { SaleType } from "./enums"

@Entity("sales")
@Index(["businessId", "createdAt"])
export class SaleTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column({ name: "receipt_number", nullable: true })
  receiptNumber?: string

  @Column({ type: "enum", enum: SaleType })
  type!: SaleType

  @Column("uuid", { name: "customer_id", nullable: true })
  customerId?: string

  @Column("uuid", { name: "created_by" })
  createdBy!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  subtotal!: string

  @Column({ type: "numeric", precision: 14, scale: 2, default: "0", name: "discount_total" })
  discountTotal!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  total!: string

  @Column({ type: "int", name: "items_count" })
  itemsCount!: number

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
