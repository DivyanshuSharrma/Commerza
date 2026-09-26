export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailStrategy {
  sendEmail(options: EmailSendOptions): Promise<void>;
}
