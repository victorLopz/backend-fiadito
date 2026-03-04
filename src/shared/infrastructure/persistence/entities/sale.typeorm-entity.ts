import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { SaleType } from "./enums"

@Entity("sales")
@Index(["businessId", "createdAt"])
export class SaleTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column("uuid")
  userId!: string

  @Column("uuid", { nullable: true })
  clientId?: string

  @Column({ type: "enum", enum: SaleType })
  type!: SaleType

  @Column({ type: "numeric", precision: 14, scale: 2 })
  subtotal!: string

  @Column({ type: "numeric", precision: 14, scale: 2, default: "0" })
  discountTotal!: string

  @Column({ type: "numeric", precision: 14, scale: 2 })
  total!: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
