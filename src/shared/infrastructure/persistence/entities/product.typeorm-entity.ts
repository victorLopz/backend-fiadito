import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("products")
@Index(["businessId", "sku"], { unique: true })
@Index(["businessId", "isActive"])
export class ProductTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid", { name: "business_id" })
  businessId!: string;

  @Column({ length: 64 })
  sku!: string;

  @Column({ length: 150 })
  name!: string;

  // barcode
  @Column({ length: 64, nullable: true })
  barcode?: string;

  @Column({ type: "numeric", precision: 14, scale: 2 })
  price!: string;

  @Column({ type: "numeric", precision: 14, scale: 2 })
  cost!: string;

  @Column({ type: "int", default: 0, name: "stock_current" })
  stockCurrent!: number;

  // stockMin
  @Column({ type: "int", default: 0, name: "stock_min" })
  stockMin!: number;

  @Column({ default: true, name: "is_active" })
  isActive!: boolean;

  // created_by
  @Column({ length: 64, name: "created_by" })
  createdBy!: string;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;
}
