import { Global, Module } from '@nestjs/common';
import { MockEmailStrategy } from '../../strategies/email/mock-email.strategy';
import { SmtpEmailStrategy } from '../../strategies/email/smtp-email.strategy';
import { ResendEmailStrategy } from '../../strategies/email/resend-email.strategy';
import { EmailFactory } from '../../providers/email/email.factory';

@Global()
@Module({
  providers: [
    MockEmailStrategy,
    SmtpEmailStrategy,
    ResendEmailStrategy,
    EmailFactory,
  ],
  exports: [
    EmailFactory,
  ],
})
export class NotificationModule {}
