export class BrandCreatedEvent {
  constructor(
    public readonly brandId: string,
    public readonly name: string,
  ) {}
}

export class BrandUpdatedEvent {
  constructor(
    public readonly brandId: string,
    public readonly name: string,
  ) {}
}

export class ProductCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly brandId: string,
    public readonly title: string,
  ) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly title: string,
  ) {}
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly brandId: string,
    public readonly productId: string,
    public readonly customerEmail: string,
  ) {}
}

export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
  ) {}
}

export class OrderRefundedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}

export class DownloadCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly token: string,
    public readonly ipAddress: string,
  ) {}
}
