import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("products_img")
@Index(["businessId", "productId"])
export class ProductImageTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid", { name: "business_id" })
  businessId!: string

  @Column("uuid", { name: "product_id" })
  productId!: string

  @Column({ name: "image_url" })
  imageUrl!: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
