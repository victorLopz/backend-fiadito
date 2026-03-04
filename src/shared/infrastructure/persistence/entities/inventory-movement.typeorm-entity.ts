import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { InventoryMovementType } from "./enums"

@Entity("inventory_movements")
@Index(["businessId", "productId", "createdAt"])
export class InventoryMovementTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column("uuid", { name: "product_id" })
  productId!: string

  @Column({ type: "enum", enum: InventoryMovementType })
  type!: InventoryMovementType

  @Column({ type: "int" })
  quantity!: number

  @Column({ nullable: true })
  reason?: string

  @Column("uuid", { nullable: true, name: "sale_id" })
  saleId?: string

  // sale_item_id
  @Column("uuid", { nullable: true, name: "sale_item_id" })
  saleItemId?: string

  // created_by
  @Column("uuid", { name: "created_by" })
  createdBy!: string

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date
}
