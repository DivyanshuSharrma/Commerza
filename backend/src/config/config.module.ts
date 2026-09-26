import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigResolverService } from './resolver/config-resolver.service';
import { SystemConfigService } from './services/system-config.service';
import { BrandConfigService } from './services/brand-config.service';
import { ProductConfigService } from './services/product-config.service';
import { OrderConfigService } from './services/order-config.service';
import { FeatureConfigService } from './services/feature-config.service';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    ConfigResolverService,
    SystemConfigService,
    BrandConfigService,
    ProductConfigService,
    OrderConfigService,
    FeatureConfigService,
    ConfigService,
  ],
  exports: [
    ConfigResolverService,
    SystemConfigService,
    BrandConfigService,
    ProductConfigService,
    OrderConfigService,
    FeatureConfigService,
    ConfigService,
  ],
})
export class ConfigModule {}
