import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('business_subscriptions')
@Index(['businessId', 'status'])
export class BusinessSubscriptionTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  businessId!: string;

  @Column('uuid')
  planId!: string;

  @Column()
  status!: string;

  @Column({ type: 'date' })
  startsAt!: string;

  @Column({ type: 'date', nullable: true })
  endsAt?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
