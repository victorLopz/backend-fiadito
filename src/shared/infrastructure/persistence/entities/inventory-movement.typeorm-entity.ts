import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryMovementType } from './enums';

@Entity('inventory_movements')
@Index(['businessId', 'productId', 'createdAt'])
export class InventoryMovementTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  businessId!: string;

  @Column('uuid')
  productId!: string;

  @Column({ type: 'enum', enum: InventoryMovementType })
  movementType!: InventoryMovementType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ nullable: true })
  reason?: string;

  @Column('uuid', { nullable: true })
  referenceId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
