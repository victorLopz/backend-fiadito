import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TokenType } from './enums';

@Entity('auth_tokens')
@Index(['businessId', 'userId', 'type'])
export class AuthTokenTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  businessId!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'enum', enum: TokenType })
  type!: TokenType;

  @Column()
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
