export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Implement email sending using Resend or another provider
  // For now, just log to console
  console.log('Sending email to:', options.to);
  console.log('Subject:', options.subject);
  console.log('Text:', options.text);
  console.log('HTML:', options.html);
}
