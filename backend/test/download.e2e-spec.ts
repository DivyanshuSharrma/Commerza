import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

// Increase Jest timeout to accommodate slow DB compiling/initialization
jest.setTimeout(30000);

describe('DownloadController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  
  let brandId: string;
  let productId: string;
  let customerId: string;
  
  let validOrderToken = 'test-token-valid-123';
  let expiredOrderToken = 'test-token-expired-456';
  let limitExceededToken = 'test-token-limit-789';
  
  let privateFilePath = 'private/files/test-asset-e2e.zip';
  let publicFilePath = 'public/files/test-image-e2e.txt';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use('/api/storage/local/public', express.static(path.join(process.cwd(), 'uploads', 'public')));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Ensure uploads folders exist
    fs.mkdirSync(path.join(process.cwd(), 'uploads', 'private', 'files'), { recursive: true });
    fs.mkdirSync(path.join(process.cwd(), 'uploads', 'public', 'files'), { recursive: true });

    // Write dummy physical files for testing streaming
    fs.writeFileSync(path.join(process.cwd(), 'uploads', privateFilePath), 'PRIVATE FILE CONTENT BYTES');
    fs.writeFileSync(path.join(process.cwd(), 'uploads', publicFilePath), 'PUBLIC IMAGE CONTENT BYTES');

    // Clean any prior E2E leftovers
    await prisma.downloadLog.deleteMany({ where: { order: { downloadToken: { in: [validOrderToken, expiredOrderToken, limitExceededToken] } } } });
    await prisma.order.deleteMany({ where: { downloadToken: { in: [validOrderToken, expiredOrderToken, limitExceededToken] } } });
    await prisma.product.deleteMany({ where: { slug: 'test-product-e2e' } });
    await prisma.customer.deleteMany({ where: { email: 'e2e-buyer@test.com' } });
    await prisma.brand.deleteMany({ where: { subdomain: 'e2e-test' } });

    // Seed mock entities for tests
    const brand = await prisma.brand.create({
      data: {
        name: 'E2E Brand',
        subdomain: 'e2e-test',
      },
    });
    brandId = brand.id;

    const product = await prisma.product.create({
      data: {
        brandId,
        title: 'E2E Product',
        slug: 'test-product-e2e',
        description: 'E2E private file course',
        price: 9.99,
        status: 'ACTIVE',
        deliveryType: 'INTERNAL_FILE',
        deliveryConfig: { filePath: privateFilePath, originalName: 'download.zip', mimeType: 'application/zip' },
      },
    });
    productId = product.id;

    const customer = await prisma.customer.create({
      data: {
        brandId,
        email: 'e2e-buyer@test.com',
        name: 'E2E Customer',
      },
    });
    customerId = customer.id;

    // Create 3 orders matching valid, expired, and limit exceeded cases
    const farFuture = new Date();
    farFuture.setHours(farFuture.getHours() + 100);

    const farPast = new Date();
    farPast.setHours(farPast.getHours() - 100);

    // 1. Valid paid order
    await prisma.order.create({
      data: {
        brandId,
        customerId,
        productId,
        status: 'PAID',
        amountPaid: 9.99,
        downloadToken: validOrderToken,
        downloadLimit: 5,
        downloadCount: 0,
        expiresAt: farFuture,
      },
    });

    // 2. Expired order
    await prisma.order.create({
      data: {
        brandId,
        customerId,
        productId,
        status: 'PAID',
        amountPaid: 9.99,
        downloadToken: expiredOrderToken,
        downloadLimit: 5,
        downloadCount: 0,
        expiresAt: farPast,
      },
    });

    // 3. Limit exceeded order
    await prisma.order.create({
      data: {
        brandId,
        customerId,
        productId,
        status: 'PAID',
        amountPaid: 9.99,
        downloadToken: limitExceededToken,
        downloadLimit: 2,
        downloadCount: 2,
        expiresAt: farFuture,
      },
    });
  });

  afterAll(async () => {
    // Cleanup files
    try {
      fs.unlinkSync(path.join(process.cwd(), 'uploads', privateFilePath));
      fs.unlinkSync(path.join(process.cwd(), 'uploads', publicFilePath));
    } catch {}

    // Cleanup DB
    await prisma.downloadLog.deleteMany({ where: { order: { downloadToken: { in: [validOrderToken, expiredOrderToken, limitExceededToken] } } } });
    await prisma.order.deleteMany({ where: { downloadToken: { in: [validOrderToken, expiredOrderToken, limitExceededToken] } } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
    await prisma.brand.deleteMany({ where: { id: brandId } });

    await app.close();
  });

  // Requirement: Direct URL access to private digital files fails
  it('should block direct HTTP access to the private uploads directory', async () => {
    await request(app.getHttpServer())
      .get(`/api/storage/local/${privateFilePath}`)
      .expect(404);
  });

  // Requirement: Direct URL access to public gallery/thumbnails succeeds
  it('should allow direct HTTP access to the public uploads directory', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/storage/local/${publicFilePath}`)
      .expect(200);
    expect(res.text).toBe('PUBLIC IMAGE CONTENT BYTES');
  });

  // Requirement: Valid download token succeeds and streams the file
  it('should successfully stream file download with a valid token', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/download/d/${validOrderToken}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('application/zip');
    expect(res.headers['content-disposition']).toContain('attachment; filename="download.zip"');
    expect(res.text).toBe('PRIVATE FILE CONTENT BYTES');
  });

  // Requirement: Expired token download fails
  it('should reject file download for an expired token', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/download/d/${expiredOrderToken}`)
      .expect(410); // Gone
  });

  // Requirement: Exceeded download limit fails
  it('should reject file download if download limit has been exceeded', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/download/d/${limitExceededToken}`)
      .expect(403); // Forbidden
  });
});
