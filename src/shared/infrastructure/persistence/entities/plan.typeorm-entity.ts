import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity("plans")
export class PlanTypeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  code!: string

  @Column({ type: "int" })
  productLimit!: number

  @Column({ type: "int", default: 30 })
  historyDays!: number

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
