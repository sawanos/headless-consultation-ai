import { NextResponse } from "next/server";
import { transcribeWithFastTranscription } from "@/lib/azure-speech";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioField = formData.get("audio");
    const localesField = formData.get("locales");

    if (!audioField || !(audioField instanceof Blob)) {
      return NextResponse.json(
        { error: "audio フィールドが必要です" },
        { status: 400 }
      );
    }

    if (audioField.size === 0) {
      return NextResponse.json(
        { error: "音声データが空です" },
        { status: 400 }
      );
    }

    const locales =
      typeof localesField === "string" && localesField.length > 0
        ? localesField
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : ["ja-JP"];

    const result = await transcribeWithFastTranscription(audioField, { locales });

    return NextResponse.json({
      text: result.text,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("[Transcribe] error:", error);
    const message =
      error instanceof Error ? error.message : "文字起こしに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
