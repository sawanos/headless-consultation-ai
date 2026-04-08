import type {
  ShareChannel,
  PrimaryHandoffPackage,
} from "@/types/consult";
import { toCopyText, toPrintablePayload } from "./handoff";

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
  isAvailable: () => !!process.env.EMAIL_ADAPTER_ENABLED,
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
  recipients: string[]
): Promise<ImmediateNotificationResult> {
  if (!handoff.notificationPolicy.immediateEmailEligible) {
    return { attempted: false, delivered: false, recipients: [] };
  }

  const emailAdapter = getAdapter("email_placeholder");
  if (!emailAdapter || !emailAdapter.isAvailable()) {
    return {
      attempted: true,
      delivered: false,
      recipients,
      errorMessage: "Email adapter is not available. Use manual sharing.",
    };
  }

  try {
    // MVP: payload 生成のみ。実送信は将来実装。
    emailAdapter.buildPayload(handoff);
    return {
      attempted: true,
      delivered: true,
      deliveredAt: new Date().toISOString(),
      recipients,
    };
  } catch (e) {
    return {
      attempted: true,
      delivered: false,
      recipients,
      errorMessage: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
