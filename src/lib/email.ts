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

/**
 * Send email via Resend or configured provider.
 * 
 * Requires RESEND_API_KEY in environment variables.
 * For development, set SKIP_EMAIL_SENDING=true to mock.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Mock mode for development
  if (process.env.SKIP_EMAIL_SENDING === 'true') {
    console.log('[DEV] Email (not sent):', {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  // TODO: Implement using Resend SDK
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // const { error } = await resend.emails.send({ from: 'noreply@example.com', ...options });
  // if (error) throw new Error(`Email send failed: ${error.message}`);
  
  throw new Error('Email sending not configured. Set up Resend or email provider.');
}
