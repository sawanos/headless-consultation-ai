// Azure AI Speech - Fast Transcription API クライアント
// https://learn.microsoft.com/azure/ai-services/speech-service/fast-transcription-create

const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "japaneast";
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_API_VERSION = "2024-11-15";

export type TranscribeOptions = {
  locales?: string[];
};

export type TranscribeResult = {
  text: string;
  durationMs: number;
};

export async function transcribeWithFastTranscription(
  audio: Blob,
  options: TranscribeOptions = {}
): Promise<TranscribeResult> {
  if (!AZURE_SPEECH_KEY) {
    throw new Error("AZURE_SPEECH_KEY が設定されていません");
  }

  const url = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=${AZURE_SPEECH_API_VERSION}`;

  const formData = new FormData();
  // 拡張子は Azure 側ではほぼ参照されないが、判別性のため付与
  formData.append("audio", audio, "audio.webm");

  const definition = {
    locales: options.locales && options.locales.length > 0 ? options.locales : ["ja-JP"],
    profanityFilterMode: "None",
  };
  formData.append("definition", JSON.stringify(definition));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Azure Fast Transcription failed: ${res.status} ${errorText}`);
  }

  const data = (await res.json()) as {
    durationMilliseconds?: number;
    combinedPhrases?: { text?: string }[];
  };

  const text = data.combinedPhrases?.[0]?.text ?? "";
  return {
    text,
    durationMs: data.durationMilliseconds ?? 0,
  };
}
