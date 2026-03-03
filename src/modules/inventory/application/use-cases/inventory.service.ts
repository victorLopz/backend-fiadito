import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  // Plan limits: validate product_limit and history retention days from active subscription.
  async createProduct(dto: Record<string, unknown>, businessId: string, userId: string): Promise<void> {
    if ((dto.initialStock as number) > 0) {
      // Create inventory movement IN for initial stock bootstrap.
    }
    void { businessId, userId };
  }

  async updateProduct(dto: Record<string, unknown>): Promise<void> {
    void dto;
  }

  async deactivateProduct(productId: string): Promise<void> {
    void productId;
  }

  async listLowStock(businessId: string): Promise<Record<string, unknown>[]> {
    void businessId;
    return [];
  }
}
