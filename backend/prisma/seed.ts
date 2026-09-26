import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'mysql://root@localhost:3306/commerza';

function parseDatabaseUrl(urlStr: string) {
  const url = new URL(urlStr);
  return {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
}

const dbConfig = parseDatabaseUrl(connectionString);
const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      permissions: [
        'brand:create', 'brand:read', 'brand:update', 'brand:delete',
        'product:create', 'product:read', 'product:update', 'product:delete',
        'setting:create', 'setting:read', 'setting:update', 'setting:delete',
        'order:create', 'order:read', 'order:update', 'order:delete',
        'customer:create', 'customer:read', 'customer:update', 'customer:delete',
        'coupon:create', 'coupon:read', 'coupon:update', 'coupon:delete',
        'audit:read'
      ],
    },
  });

  const brandAdminRole = await prisma.role.upsert({
    where: { name: 'BRAND_ADMIN' },
    update: {},
    create: {
      name: 'BRAND_ADMIN',
      permissions: [
        'product:create', 'product:read', 'product:update', 'product:delete',
        'setting:read', 'setting:update',
        'order:read', 'order:update',
        'customer:read',
        'coupon:create', 'coupon:read', 'coupon:update', 'coupon:delete',
        'audit:read'
      ],
    },
  });

  const supportRole = await prisma.role.upsert({
    where: { name: 'SUPPORT' },
    update: {},
    create: {
      name: 'SUPPORT',
      permissions: [
        'product:read',
        'setting:read',
        'order:read', 'order:update',
        'customer:read'
      ],
    },
  });

  // 2. Create Default Brand
  const defaultBrand = await prisma.brand.upsert({
    where: { subdomain: 'default' },
    update: {},
    create: {
      name: 'Commerza Store',
      subdomain: 'default',
      primaryColor: '#4f46e5', // indigo-600
      secondaryColor: '#06b6d4', // cyan-500
      themeSettings: {
        heroTitle: 'Welcome to Commerza',
        heroSubtitle: 'The ultimate white-label digital products marketplace.',
      },
    },
  });

  // 3. Create Default User (Super Admin)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const defaultAdmin = await prisma.user.upsert({
    where: { email: 'admin@commerza.com' },
    update: {},
    create: {
      email: 'admin@commerza.com',
      password: hashedPassword,
      name: 'Super Admin',
      roleId: superAdminRole.id,
    },
  });

  // 4. Create default settings
  const defaultSettings = [
    // System defaults
    { key: 'download_limit', value: '5', level: 'SYSTEM' as const, entityId: null },
    { key: 'link_expiry_hours', value: '24', level: 'SYSTEM' as const, entityId: null },
    { key: 'storage_provider', value: 'LOCAL', level: 'SYSTEM' as const, entityId: null },
    { key: 'payment_provider', value: 'MOCK', level: 'SYSTEM' as const, entityId: null },
    { key: 'email_provider', value: 'MOCK', level: 'SYSTEM' as const, entityId: null },
    
    // Global defaults (which can override system, but let's keep them equal for now)
    { key: 'download_limit', value: '5', level: 'GLOBAL' as const, entityId: null },
    { key: 'link_expiry_hours', value: '24', level: 'GLOBAL' as const, entityId: null },
    { key: 'storage_provider', value: 'LOCAL', level: 'GLOBAL' as const, entityId: null },
    { key: 'payment_provider', value: 'MOCK', level: 'GLOBAL' as const, entityId: null },
    { key: 'email_provider', value: 'MOCK', level: 'GLOBAL' as const, entityId: null },

    // Brand defaults (specific to default brand)
    { key: 'download_limit', value: '10', level: 'BRAND' as const, entityId: defaultBrand.id }, // Override for default brand
    { key: 'storage_provider', value: 'LOCAL', level: 'BRAND' as const, entityId: defaultBrand.id },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.setting.findFirst({
      where: {
        key: setting.key,
        level: setting.level,
        entityId: setting.entityId,
      },
    });

    if (existing) {
      await prisma.setting.update({
        where: { id: existing.id },
        data: { value: setting.value },
      });
    } else {
      await prisma.setting.create({
        data: setting,
      });
    }
  }

  console.log('Seeding completed successfully!');
  console.log(`Default admin: admin@commerza.com / admin123`);
  console.log(`Default brand subdomain: default`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
