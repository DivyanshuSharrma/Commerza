import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigContext } from '../../config/config.service';
import { EmailStrategy } from '../../core/interfaces/email-strategy.interface';
import { MockEmailStrategy } from '../../strategies/email/mock-email.strategy';
import { SmtpEmailStrategy } from '../../strategies/email/smtp-email.strategy';
import { ResendEmailStrategy } from '../../strategies/email/resend-email.strategy';

@Injectable()
export class EmailFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockEmailStrategy: MockEmailStrategy,
    private readonly smtpEmailStrategy: SmtpEmailStrategy,
    private readonly resendEmailStrategy: ResendEmailStrategy,
  ) {}

  async getStrategy(context?: ConfigContext): Promise<EmailStrategy> {
    const provider = await this.configService.get('email_provider', context, 'MOCK');
    
    switch (provider.toUpperCase()) {
      case 'SMTP':
        return this.smtpEmailStrategy;
      case 'RESEND':
        return this.resendEmailStrategy;
      case 'MOCK':
      default:
        return this.mockEmailStrategy;
    }
  }
}
