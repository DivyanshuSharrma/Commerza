import { Injectable, HttpStatus } from '@nestjs/common';
import { OrderRepository } from '../../database/repositories/order.repository';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class OrderQueryService {
  constructor(private readonly orderRepo: OrderRepository) {}

  async findOne(id: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new BusinessException('Order not found', HttpStatus.NOT_FOUND);
    return order;
  }

  async findByToken(token: string) {
    const order = await this.orderRepo.findByDownloadToken(token);
    if (!order) throw new BusinessException('Order download token not found', HttpStatus.NOT_FOUND);
    return order;
  }

  async findAll(brandId?: string) {
    return this.orderRepo.findMany(brandId);
  }
}
