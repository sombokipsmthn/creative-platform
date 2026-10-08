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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [options.to], subject: options.subject, text: options.text, html: options.html }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}.`);
  }
}
