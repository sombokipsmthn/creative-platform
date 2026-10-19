import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSend, constructedApiKeys } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  constructedApiKeys: [] as string[],
}));

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockSend };

    constructor(public apiKey: string) {
      constructedApiKeys.push(apiKey);
    }
  },
}));

import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";
import { sendEmail } from "./email";

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Creative Platform <noreply@example.com>";
    constructedApiKeys.length = 0;
    delete process.env.SKIP_EMAIL_SENDING;
  });

  it("sends email fields through the Resend SDK", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    await sendEmail({
      to: "recipient@example.com",
      subject: "Hello World",
      text: "Plain-text message",
      html: "<p>Hello World</p>",
    });

    expect(constructedApiKeys).toEqual(["re_test_key"]);
    expect(mockSend).toHaveBeenCalledWith({
      from: "Creative Platform <noreply@example.com>",
      to: ["recipient@example.com"],
      subject: "Hello World",
      text: "Plain-text message",
      html: "<p>Hello World</p>",
      attachments: undefined,
    });
  });

  it("throws the provider error without exposing the API key", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "The sender domain is not verified" },
    });

    await expect(
      sendEmail({
        to: "recipient@example.com",
        subject: "Hello World",
        html: "<p>Hello World</p>",
      }),
    ).rejects.toThrow("Email delivery failed: The sender domain is not verified");
  });

  it("fails clearly when email configuration is missing", async () => {
    delete process.env.RESEND_API_KEY;

    await expect(
      sendEmail({
        to: "recipient@example.com",
        subject: "Hello World",
      }),
    ).rejects.toThrow("Set RESEND_API_KEY and EMAIL_FROM");

    expect(mockSend).not.toHaveBeenCalled();
  });
});
