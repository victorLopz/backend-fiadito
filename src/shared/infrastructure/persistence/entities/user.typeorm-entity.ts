import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BusinessTypeOrmEntity } from './business.typeorm-entity';
import { UserRole } from './enums';

@Entity('users')
@Index(['businessId', 'email'], { unique: true })
@Index(['businessId', 'phone'], { unique: true })
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @ManyToOne(() => BusinessTypeOrmEntity)
  business!: BusinessTypeOrmEntity;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
