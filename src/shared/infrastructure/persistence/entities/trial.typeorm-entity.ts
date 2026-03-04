import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

@Entity("trials")
@Index(["businessId"])
export class TrialTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column("uuid")
  businessId!: string

  @Column({ type: "date" })
  startsAt!: string

  @Column({ type: "date" })
  endsAt!: string

  @Column({ default: false })
  convertedToPaid!: boolean

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date
}
