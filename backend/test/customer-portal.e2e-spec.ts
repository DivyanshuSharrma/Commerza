import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

jest.setTimeout(35000);

describe('Customer Portal (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let brandId: string;
  let customerId: string;
  let productId: string;
  let orderId: string;
  let customerJwt: string;

  const testEmail = 'portal-buyer@test.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean prior test records
    await prisma.customerAuthToken.deleteMany({ where: { email: testEmail } });
    await prisma.downloadLog.deleteMany({ where: { order: { customer: { email: testEmail } } } });
    await prisma.order.deleteMany({ where: { customer: { email: testEmail } } });
    await prisma.product.deleteMany({ where: { slug: 'portal-test-bundle' } });
    await prisma.customer.deleteMany({ where: { email: testEmail } });
    await prisma.brand.deleteMany({ where: { subdomain: 'portal-test-brand' } });

    // Seed Brand
    const brand = await prisma.brand.create({
      data: {
        name: 'Portal Test Studio',
        subdomain: 'portal-test-brand',
      },
    });
    brandId = brand.id;

    // Seed Customer
    const customer = await prisma.customer.create({
      data: {
        brandId,
        email: testEmail,
        name: 'Portal Tester',
      },
    });
    customerId = customer.id;

    // Seed Product
    const product = await prisma.product.create({
      data: {
        brandId,
        title: 'Portal Digital Suite',
        slug: 'portal-test-bundle',
        description: 'Test digital software package',
        price: 49.0,
        status: 'ACTIVE',
        deliveryType: 'EXTERNAL_URL',
        deliveryConfig: { url: 'https://example.com/asset.zip' },
      },
    });
    productId = product.id;

    // Seed Paid Order
    const order = await prisma.order.create({
      data: {
        brandId,
        customerId,
        productId,
        amountPaid: 49.0,
        status: 'PAID',
        paymentProvider: 'MOCK',
        paymentId: 'portal_pay_test',
        downloadToken: 'portal-token-abc-123',
        downloadLimit: 5,
        downloadCount: 1,
        expiresAt: new Date(Date.now() - 10000), // Expired on purpose to test renewal
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.customerAuthToken.deleteMany({ where: { email: testEmail } }).catch(() => {});
      await prisma.downloadLog.deleteMany({ where: { order: { customer: { email: testEmail } } } }).catch(() => {});
      await prisma.order.deleteMany({ where: { customer: { email: testEmail } } }).catch(() => {});
      if (productId) await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
      if (customerId) await prisma.customer.deleteMany({ where: { id: customerId } }).catch(() => {});
      if (brandId) await prisma.brand.deleteMany({ where: { id: brandId } }).catch(() => {});
    }
    await app.close();
  });

  it('1. should request a login OTP and dispatch email / token record', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/customer-portal/auth/request-otp')
      .send({ email: testEmail, brandId })
      .expect(200);

    expect(res.body.data.message).toBeDefined();

    // Verify token was stored in database
    const tokenRecord = await prisma.customerAuthToken.findFirst({
      where: { email: testEmail },
    });
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord?.code).toHaveLength(6);
    expect(tokenRecord?.token).toBeDefined();
  });

  it('2. should verify OTP and return scoped customer JWT session', async () => {
    const tokenRecord = await prisma.customerAuthToken.findFirst({
      where: { email: testEmail },
    });
    expect(tokenRecord).not.toBeNull();

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer-portal/auth/verify')
      .send({
        email: testEmail,
        code: tokenRecord!.code,
      })
      .expect(200);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.customer.email).toBe(testEmail);
    customerJwt = res.body.data.accessToken;

    // Token record should be deleted after consumption (single-use)
    const consumed = await prisma.customerAuthToken.findUnique({
      where: { id: tokenRecord!.id },
    });
    expect(consumed).toBeNull();
  });

  it('3. should retrieve customer past orders using customer JWT', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/customer-portal/orders')
      .set('Authorization', `Bearer ${customerJwt}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].orderId).toBe(orderId);
    expect(res.body.data[0].product.title).toBe('Portal Digital Suite');
    expect(res.body.data[0].downloadToken).toBe('portal-token-abc-123');
    expect(res.body.data[0].isExpired).toBe(true);
  });

  it('4. should refresh and renew an expired download token', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/customer-portal/orders/${orderId}/refresh-token`)
      .set('Authorization', `Bearer ${customerJwt}`)
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.orderId).toBe(orderId);
    expect(res.body.data.isExpired).toBe(false);
    expect(res.body.data.downloadToken).not.toBe('portal-token-abc-123');
    expect(res.body.data.canDownload).toBe(true);
  });
});
