import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { Logger } from '@nestjs/common';

async function runEncryptionMigration() {
  const logger = new Logger('EncryptExistingSecrets');
  logger.log('Starting migration to encrypt existing plaintext credentials in database...');

  const prisma = new PrismaService();
  const encryptionService = new EncryptionService();

  try {
    await prisma.$connect();
    const allSettings = await prisma.setting.findMany();
    let encryptedCount = 0;
    let skippedCount = 0;

    for (const setting of allSettings) {
      if (encryptionService.isSensitiveKey(setting.key)) {
        if (!encryptionService.isEncrypted(setting.value)) {
          const encryptedValue = encryptionService.encrypt(setting.value);
          await prisma.setting.update({
            where: { id: setting.id },
            data: { value: encryptedValue },
          });
          logger.log(`✓ Encrypted key: "${setting.key}" [ID: ${setting.id}]`);
          encryptedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    logger.log(`Migration completed. Total encrypted: ${encryptedCount}, Already encrypted: ${skippedCount}`);
  } catch (err: any) {
    logger.error(`Migration failed: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runEncryptionMigration();
}

export { runEncryptionMigration };
