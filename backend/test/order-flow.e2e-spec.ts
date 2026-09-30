import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import * as fs from 'fs';
import * as path from 'path';

jest.setTimeout(35000);

describe('Complete E2E Order Flow (Checkout -> Coupon -> Payment -> Token -> Download -> Invoice)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let brandId: string;
  let productId: string;
  let couponId: string;
  let orderId: string;
  let downloadToken: string;

  const couponCode = 'E2EFLOW25';
  const customerEmail = 'orderflow-shopper@test.com';
  const privateFilePath = 'private/files/order-flow-bundle.zip';
  const dummyPayload = 'E2E ORDER FLOW BINARY ARCHIVE PAYLOAD';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Ensure uploads private folder exists and write test binary archive
    const fullDirPath = path.join(process.cwd(), 'uploads', 'private', 'files');
    fs.mkdirSync(fullDirPath, { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'uploads', privateFilePath), dummyPayload);

    // Clean up any potential stale records or provider overrides
    await prisma.setting.deleteMany({ where: { key: 'payment_provider' } }).catch(() => {});
    await prisma.downloadLog.deleteMany({ where: { order: { customer: { email: customerEmail } } } });
    await prisma.order.deleteMany({ where: { customer: { email: customerEmail } } });
    await prisma.coupon.deleteMany({ where: { code: couponCode } });
    await prisma.product.deleteMany({ where: { slug: 'e2e-complete-flow-kit' } });
    await prisma.customer.deleteMany({ where: { email: customerEmail } });
    await prisma.brand.deleteMany({ where: { subdomain: 'orderflow-test-brand' } });

    // 1. Seed Test Brand
    const brand = await prisma.brand.create({
      data: {
        name: 'OrderFlow Test Studio',
        subdomain: 'orderflow-test-brand',
      },
    });
    brandId = brand.id;

    // 2. Seed Test Coupon (25% off)
    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        discount: 25,
        isPercent: true,
        active: true,
        usageLimit: 10,
        usageCount: 0,
      },
    });
    couponId = coupon.id;

    // 3. Seed Test Digital Product with Private File Delivery
    const product = await prisma.product.create({
      data: {
        brandId,
        title: 'E2E Architecture Kit',
        slug: 'e2e-complete-flow-kit',
        description: 'Complete digital software boilerplate',
        price: 100.0,
        salePrice: null,
        status: 'ACTIVE',
        deliveryType: 'INTERNAL_FILE',
        deliveryConfig: {
          filePath: privateFilePath,
          originalName: 'source-bundle.zip',
          mimeType: 'application/zip',
        },
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    // Teardown database test entities
    if (prisma) {
      await prisma.downloadLog.deleteMany({ where: { order: { customer: { email: customerEmail } } } }).catch(() => {});
      await prisma.order.deleteMany({ where: { customer: { email: customerEmail } } }).catch(() => {});
      if (couponId) await prisma.coupon.deleteMany({ where: { id: couponId } }).catch(() => {});
      if (productId) await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
      await prisma.customer.deleteMany({ where: { email: customerEmail } }).catch(() => {});
      if (brandId) await prisma.brand.deleteMany({ where: { id: brandId } }).catch(() => {});
    }

    // Teardown temporary file on disk
    const targetFile = path.join(process.cwd(), 'uploads', privateFilePath);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }

    await app.close();
  });

  // ─── STEP 1: COUPON VALIDATION ─────────────────────────────────────────────
  it('1. should validate the coupon code successfully and return 25% discount', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/coupons/validate')
      .send({
        code: couponCode,
        brandId,
      })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.code).toBe(couponCode);
    expect(Number(res.body.data.discount)).toBe(25);
    expect(res.body.data.isPercent).toBe(true);
  });

  // ─── STEP 2: CHECKOUT & COUPON DISCOUNT APPLICATION ────────────────────────
  it('2. should checkout with coupon applied, calculate discounted total ($75) and create PENDING order', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .send({
        email: customerEmail,
        name: 'Alex Morgan',
        productId,
        brandId,
        couponCode,
      })
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.orderId).toBeDefined();
    expect(res.body.data.downloadToken).toBeDefined();
    // 25% discount on $100 base price = $75
    expect(Number(res.body.data.amount)).toBe(75);

    orderId = res.body.data.orderId;
    downloadToken = res.body.data.downloadToken;

    // Verify DB order status is PENDING
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.status).toBe('PENDING');
    expect(Number(dbOrder?.amountPaid)).toBe(75);
  });

  // ─── STEP 3: PAYMENT FULFILLMENT ───────────────────────────────────────────
  it('3. should fulfill order via sandbox fulfillment and transition status to PAID', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/mock-fulfill/${orderId}`)
      .send({
        paymentId: 'e2e_mock_trans_9999',
      })
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('PAID');
    expect(res.body.data.paymentId).toBe('e2e_mock_trans_9999');

    // Verify coupon usageCount incremented in DB
    const dbCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    expect(dbCoupon?.usageCount).toBe(1);
  });

  // ─── STEP 4: TOKEN VAULT INFO CHECK ────────────────────────────────────────
  it('4. should retrieve active token metadata from the vault info endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/download/info/${downloadToken}`)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.productTitle).toBe('E2E Architecture Kit');
    expect(res.body.data.isPaid).toBe(true);
    expect(res.body.data.downloadCount).toBe(0);
    expect(res.body.data.downloadLimit).toBeGreaterThanOrEqual(5);
    expect(res.body.data.isExpired).toBe(false);
    expect(res.body.data.isLimitExceeded).toBe(false);
  });

  // ─── STEP 5: BINARY FILE STREAMING & QUOTA DECREMENT ───────────────────────
  it('5. should stream the raw binary artifact and record download usage log', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/download/d/${downloadToken}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('application/zip');
    expect(res.headers['content-disposition']).toContain('attachment; filename="source-bundle.zip"');
    expect(res.text).toBe(dummyPayload);

    // Verify download count is incremented
    const infoRes = await request(app.getHttpServer())
      .get(`/api/v1/download/info/${downloadToken}`)
      .expect(200);

    expect(infoRes.body.data.downloadCount).toBe(1);
  });

  // ─── STEP 6: DYNAMIC VECTOR PDF TAX INVOICE GENERATION ─────────────────────
  it('6. should stream a valid high-resolution vector PDF invoice for the settled order', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/invoice`)
      .expect(200);

    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('inline; filename="Invoice-');
    expect(res.headers['content-disposition']).toContain('.pdf"');

    // Vector PDF streams always begin with standard magic bytes '%PDF-'
    const pdfBuffer = Buffer.from(res.body);
    const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
    expect(pdfHeader).toBe('%PDF-');
  });

  // ─── STEP 7: INVOICE SECURITY GUARD FOR UNPAID ORDERS ──────────────────────
  it('7. should reject PDF invoice generation if an order has not been paid', async () => {
    // Create an arbitrary unpaid pending order
    const pendingOrder = await prisma.order.create({
      data: {
        brandId,
        productId,
        customerId: (await prisma.customer.findFirst({ where: { email: customerEmail } }))!.id,
        amountPaid: 100,
        downloadToken: 'unpaid-token-e2e',
        downloadLimit: 5,
        expiresAt: new Date(Date.now() + 1000000),
        status: 'PENDING',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${pendingOrder.id}/invoice`)
      .expect(400);

    expect(res.body.error?.message || res.body.message).toContain('only issued for verified and settled PAID orders');

    // Clean up temporary pending order
    await prisma.order.delete({ where: { id: pendingOrder.id } });
  });
});
