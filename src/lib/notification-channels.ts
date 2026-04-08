import type {
  ShareChannel,
  PrimaryHandoffPackage,
} from "@/types/consult";
import { toCopyText, toPrintablePayload } from "./handoff";
import { isEmailEnabled, sendHandoffEmail } from "./email-sender";

export type HandoffChannelAdapter = {
  channel: ShareChannel;
  isAvailable: () => boolean;
  buildPayload: (handoff: PrimaryHandoffPackage) => unknown;
};

export type ImmediateNotificationResult = {
  attempted: boolean;
  delivered: boolean;
  deliveredAt?: string;
  recipients: string[];
  errorMessage?: string;
};

const copyTextAdapter: HandoffChannelAdapter = {
  channel: "copy_text",
  isAvailable: () => true,
  buildPayload: (handoff) => toCopyText(handoff),
};

const printableAdapter: HandoffChannelAdapter = {
  channel: "printable_pdf",
  isAvailable: () => true,
  buildPayload: (handoff) => toPrintablePayload(handoff),
};

const secureLinkAdapter: HandoffChannelAdapter = {
  channel: "secure_link",
  isAvailable: () => true,
  buildPayload: (handoff) => ({
    type: "secure_link",
    caseHeadline: handoff.headline,
    escalationLevel: handoff.recommendedEscalationLevel,
  }),
};

const emailPlaceholderAdapter: HandoffChannelAdapter = {
  channel: "email_placeholder",
  // Resend が設定されていれば実送信可能
  isAvailable: () => isEmailEnabled(),
  buildPayload: (handoff) => ({
    subject: `【相談サポート】${handoff.headline}`,
    body: handoff.shareText,
    escalationLevel: handoff.recommendedEscalationLevel,
  }),
};

const faxPlaceholderAdapter: HandoffChannelAdapter = {
  channel: "fax_placeholder",
  isAvailable: () => false,
  buildPayload: (handoff) => ({
    header: handoff.headline,
    body: handoff.shareText,
  }),
};

const adapters: HandoffChannelAdapter[] = [
  copyTextAdapter,
  printableAdapter,
  secureLinkAdapter,
  emailPlaceholderAdapter,
  faxPlaceholderAdapter,
];

export function getAdapter(channel: ShareChannel): HandoffChannelAdapter | undefined {
  return adapters.find((a) => a.channel === channel);
}

export function getAvailableChannels(): ShareChannel[] {
  return adapters.filter((a) => a.isAvailable()).map((a) => a.channel);
}

export async function sendImmediateNotification(
  handoff: PrimaryHandoffPackage,
  caseId: string,
  recipientEmail?: string | null
): Promise<ImmediateNotificationResult> {
  if (!handoff.notificationPolicy.immediateEmailEligible) {
    return { attempted: false, delivered: false, recipients: [] };
  }

  if (!isEmailEnabled()) {
    return {
      attempted: true,
      delivered: false,
      recipients: recipientEmail ? [recipientEmail] : [],
      errorMessage:
        "メール送信が設定されていません（RESEND_API_KEY 未設定）",
    };
  }

  const result = await sendHandoffEmail({
    caseId,
    handoff,
    to: recipientEmail || null,
  });

  if (result.success) {
    return {
      attempted: true,
      delivered: true,
      deliveredAt: result.sentAt,
      recipients: result.to,
    };
  }

  return {
    attempted: true,
    delivered: false,
    recipients: result.to,
    errorMessage: result.error,
  };
}
