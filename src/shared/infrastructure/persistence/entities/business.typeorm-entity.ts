import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"

@Entity("businesses")
export class BusinessTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Index({ unique: true })
  @Column({ length: 120, name: "legal_name" })
  legalName!: string

  // currency_code
  @Column({ length: 3, name: "currency_code", nullable: true, default: "NIO" })
  currencyCode?: string

  // country_code
  @Column({ length: 2, name: "country_code", nullable: true, default: "NI" })
  countryCode?: string

  // timezone
  @Column({
    length: 50,
    name: "timezone",
    nullable: true,
    default: "America/Managua"
  })
  timezone?: string

  //receipt_prefix
  @Column({ length: 10, name: "receipt_prefix", nullable: true })
  receiptPrefix?: string

  // receipt_next_number
  @Column({ name: "receipt_next_number", nullable: true, default: 1 })
  receiptNextNumber?: number

  @Column({ default: true, name: "is_active" })
  isActive!: boolean

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date
}
