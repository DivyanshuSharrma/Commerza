import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // 1. Security Headers & CORS
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP temporarily if testing Swagger locally
  }));
  app.enableCors();

  // Serve public uploads directory under /api/storage/local/public prefix
  app.use('/api/storage/local/public', express.static(path.join(process.cwd(), 'uploads', 'public')));

  // 2. Global Route Prefix
  app.setGlobalPrefix('api/v1');

  // 3. Global Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 4. Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 5. Swagger OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Commerza Engine API')
    .setDescription('The enterprise-grade, white-label digital commerce platform API.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // 6. Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Commerza engine running at http://localhost:${port}/api/v1`);
  console.log(`Swagger docs available at http://localhost:${port}/api/v1/docs`);
}
bootstrap();
