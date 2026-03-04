import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("vouchers")
@Index(["businessId", "saleId"], { unique: true })
export class VoucherTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column("uuid")
  saleId!: string

  @Column()
  imageUrl!: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
