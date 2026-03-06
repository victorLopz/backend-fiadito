import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("sale_items")
@Index(["businessId", "saleId"])
export class SaleItemTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column("uuid", { name: "sale_id" })
  saleId!: string

  @Column("uuid", { name: "product_id" })
  productId!: string

  @Column({ type: "int" })
  quantity!: number

  @Column({ type: "numeric", precision: 14, scale: 2, name: "unit_price" })
  unitPrice!: string

  @Column({ type: "numeric", precision: 14, scale: 2, name: "unit_cost" })
  unitCost!: string

  @Column({ type: "numeric", precision: 14, scale: 2, default: "0", name: "line_discount" })
  lineDiscount!: string

  @Column({ type: "numeric", precision: 14, scale: 2, name: "line_total" })
  lineTotal!: string

  @Column({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
