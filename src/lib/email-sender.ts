import { Resend } from "resend";
import type { PrimaryHandoffPackage } from "@/types/consult";
import {
  buildHandoffEmailBody,
  buildHandoffEmailSubject,
} from "./email-templates";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const DEFAULT_PRIMARY_PHYSICIAN_EMAIL =
  process.env.DEFAULT_PRIMARY_PHYSICIAN_EMAIL || "";

let resendInstance: Resend | null = null;
function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(RESEND_API_KEY);
  }
  return resendInstance;
}

export type SendHandoffEmailInput = {
  caseId: string;
  handoff: PrimaryHandoffPackage;
  /** ケース固有の宛先。未指定なら DEFAULT_PRIMARY_PHYSICIAN_EMAIL を使用 */
  to?: string | null;
  /** BCC（管理者通知など） */
  bcc?: string[];
};

export type SendHandoffEmailResult =
  | {
      success: true;
      provider: "resend";
      messageId?: string;
      to: string[];
      sentAt: string;
    }
  | {
      success: false;
      error: string;
      to: string[];
    };

export function resolveRecipient(input: SendHandoffEmailInput): string | null {
  const candidate = (input.to || DEFAULT_PRIMARY_PHYSICIAN_EMAIL || "").trim();
  return candidate.length > 0 ? candidate : null;
}

export async function sendHandoffEmail(
  input: SendHandoffEmailInput
): Promise<SendHandoffEmailResult> {
  const recipient = resolveRecipient(input);
  if (!recipient) {
    return {
      success: false,
      error:
        "宛先メールアドレスが未設定です（ケース or DEFAULT_PRIMARY_PHYSICIAN_EMAIL）",
      to: [],
    };
  }

  const resend = getResend();
  if (!resend) {
    return {
      success: false,
      error: "RESEND_API_KEY が設定されていません",
      to: [recipient],
    };
  }

  const subject = buildHandoffEmailSubject(input.handoff, input.caseId);
  const text = buildHandoffEmailBody(input.handoff, input.caseId);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [recipient],
      bcc: input.bcc && input.bcc.length > 0 ? input.bcc : undefined,
      subject,
      text,
    });

    if (error) {
      return {
        success: false,
        error: `${error.name || "ResendError"}: ${error.message || JSON.stringify(error)}`,
        to: [recipient],
      };
    }

    return {
      success: true,
      provider: "resend",
      messageId: data?.id,
      to: [recipient],
      sentAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown email send error",
      to: [recipient],
    };
  }
}

export function isEmailEnabled(): boolean {
  return !!RESEND_API_KEY;
}
