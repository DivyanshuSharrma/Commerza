import { EmailStrategy, EmailSendOptions } from '../../core/interfaces/email-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockEmailStrategy implements EmailStrategy {
  private readonly logger = new Logger(MockEmailStrategy.name);

  async sendEmail(options: EmailSendOptions): Promise<void> {
    this.logger.log(`[MOCK EMAIL SENT] To: ${options.to} | Subject: ${options.subject}`);
    this.logger.log(`[Body Snippet]: ${options.html.substring(0, 150)}...`);
  }
}
