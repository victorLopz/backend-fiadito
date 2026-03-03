import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SalesService {
  constructor(private readonly dataSource: DataSource) {}

  async createSale(dto: any): Promise<{ saleId: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Rule: if sale.type=CREDIT then client_id is mandatory and debt must be created.
      // Snapshot rule: each sale_item stores unit_price and unit_cost at sale time.
      // Inventory rule: every sold item creates an OUT movement and decreases stock.
      // Validate allow_negative_stock on product before decrementing.
      const sale = { id: randomUUID() };
      // Placeholder voucher with image_url to be replaced by rendering job.
      void dto;
      await queryRunner.commitTransaction();
      return { saleId: sale.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listSales(filters: { businessId: string; from: Date; to: Date }): Promise<Record<string, unknown>[]> {
    void filters;
    return [];
  }
}
