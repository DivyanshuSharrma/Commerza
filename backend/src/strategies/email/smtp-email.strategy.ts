import { EmailStrategy, EmailSendOptions } from '../../core/interfaces/email-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpEmailStrategy implements EmailStrategy {
  private readonly logger = new Logger(SmtpEmailStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  private async getTransporter(context?: any): Promise<{ transporter: nodemailer.Transporter; from: string }> {
    const host = await this.configService.get('smtp_host', context);
    const port = await this.configService.getNumber('smtp_port', context, 587);
    const user = await this.configService.get('smtp_user', context);
    const pass = await this.configService.get('smtp_pass', context);
    const from = await this.configService.get('smtp_from', context, 'noreply@commerza.com');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    return { transporter, from };
  }

  async sendEmail(options: EmailSendOptions): Promise<void> {
    try {
      const { transporter, from } = await this.getTransporter();
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`SMTP email sent successfully to ${options.to}`);
    } catch (err: any) {
      this.logger.error(`SMTP email failed: ${err.message}`);
      throw err;
    }
  }
}
