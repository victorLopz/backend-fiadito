import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
@Index(['businessId', 'sku'], { unique: true })
@Index(['businessId', 'isActive'])
export class ProductTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  businessId!: string;

  @Column({ length: 64 })
  sku!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  price!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  cost!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ default: false })
  allowNegativeStock!: boolean;

  @Column({ type: 'int', default: 5 })
  lowStockThreshold!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
