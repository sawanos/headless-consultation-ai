import { NextResponse } from "next/server";
import { sendHandoffEmail, isEmailEnabled } from "@/lib/email-sender";
import type { PrimaryHandoffPackage } from "@/types/consult";

export const runtime = "nodejs";

const SAMPLE_HANDOFF: PrimaryHandoffPackage = {
  headline: "テスト送信：呼吸苦に関する相談（YELLOW）",
  observationSummary: [
    "本日の様子: いつもより呼吸が浅い",
    "発症時刻: 朝食後",
  ],
  vitalSummary: [
    "SpO2: 93%（注意）",
    "脈拍: 96回/分（正常）",
    "体温: 36.8℃（正常）",
  ],
  concernPoints: ["SpO2 が普段より低下しています"],
  generalMedicalInfo: [
    "一般的には、SpO2 低下時には酸素飽和度の継続観察が推奨されます。",
  ],
  recommendedEscalationLevel: "within_24h",
  authoredBy: "AI",
  recommendedChannel: "email_placeholder",
  shareText:
    "【テスト送信】Headless Consultation AI からのテストメールです。\n本文は通常のハンドオフと同じフォーマットで送信されます。",
  notificationPolicy: {
    immediateEmailEligible: false,
    includeInDailyDigest: false,
    manualShareRecommended: true,
  },
};

export async function POST(request: Request) {
  if (!isEmailEnabled()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY が設定されていません" },
      { status: 503 }
    );
  }

  let to: string | undefined;
  try {
    const body = (await request.json().catch(() => ({}))) as { to?: string };
    to = body.to;
  } catch {
    /* noop */
  }

  const result = await sendHandoffEmail({
    caseId: "test-" + Date.now().toString(36),
    handoff: SAMPLE_HANDOFF,
    to: to ?? null,
  });

  if (result.success) {
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      sentAt: result.sentAt,
    });
  }

  return NextResponse.json(
    { success: false, error: result.error, to: result.to },
    { status: 502 }
  );
}

export async function GET() {
  // GET でも同じ動作（ブラウザから簡単に叩けるよう）
  return POST(new Request("http://localhost/", { method: "POST", body: "{}" }));
}
