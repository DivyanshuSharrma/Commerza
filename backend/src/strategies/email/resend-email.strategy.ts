import { EmailStrategy, EmailSendOptions } from '../../core/interfaces/email-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ResendEmailStrategy implements EmailStrategy {
  private readonly logger = new Logger(ResendEmailStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(options: EmailSendOptions): Promise<void> {
    try {
      const apiKey = await this.configService.get('resend_api_key');
      const from = await this.configService.get('smtp_from', {}, 'noreply@commerza.com');

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Resend API responded with status ${response.status}: ${errText}`);
      }

      this.logger.log(`Resend email sent successfully to ${options.to}`);
    } catch (err: any) {
      this.logger.error(`Resend email failed: ${err.message}`);
      throw err;
    }
  }
}
