import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("sale_items")
@Index(["businessId", "saleId"])
export class SaleItemTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column("uuid")
  saleId!: string

  @Column("uuid")
  productId!: string

  @Column({ type: "int" })
  quantity!: number

  @Column({ type: "numeric", precision: 14, scale: 2 })
  unitPrice!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  unitCost!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  lineTotal!: string
}
