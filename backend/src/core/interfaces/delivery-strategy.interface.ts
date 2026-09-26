import { Response } from 'express';

export interface DeliveryStrategy {
  deliver(orderId: string, deliveryConfig: any, res: Response): Promise<void>;
}
