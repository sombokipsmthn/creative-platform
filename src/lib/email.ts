import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (process.env.SKIP_EMAIL_SENDING === "true") {
    console.warn("Email sending skipped by configuration.");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  const resend = new Resend(apiKey);
  const payload = {
    from,
    to: [options.to],
    subject: options.subject,
    ...(options.text ? { text: options.text } : {}),
    ...(options.html ? { html: options.html } : {}),
    ...(options.attachments ? { attachments: options.attachments } : {}),
  } as CreateEmailOptions;

  const { error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
