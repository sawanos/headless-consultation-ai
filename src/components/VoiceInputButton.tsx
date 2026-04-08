"use client";

import { useState, useRef, useCallback } from "react";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
};

type RecorderState = "idle" | "recording" | "uploading" | "error";

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

const SIZE_CLASSES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

const ICON_SIZE: Record<NonNullable<Props["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

function MicIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

export default function VoiceInputButton({
  onTranscript,
  disabled = false,
  size = "md",
  label = "押して話す",
}: Props) {
  const [state, setState] = useState<RecorderState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    if (state === "recording" || state === "uploading" || disabled) return;
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size === 0) {
          setState("idle");
          return;
        }
        setState("uploading");
        try {
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");
          fd.append("locales", "ja-JP");
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          const data = (await res.json()) as { text?: string };
          if (data.text && data.text.trim()) {
            onTranscript(data.text.trim());
          }
          setState("idle");
        } catch (e) {
          console.error("[VoiceInput] upload error:", e);
          setErrorMsg(e instanceof Error ? e.message : "文字起こしに失敗しました");
          setState("error");
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setState("recording");
    } catch (e) {
      console.error("[VoiceInput] mic error:", e);
      setErrorMsg("マイクの利用許可が必要です");
      setState("error");
      stopStream();
    }
  }, [state, disabled, onTranscript]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const isRecording = state === "recording";
  const isUploading = state === "uploading";

  const buttonClass = isRecording
    ? "bg-red-500 text-white border-red-500 animate-pulse"
    : isUploading
    ? "bg-gray-200 text-gray-500 border-gray-200"
    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50";

  const displayLabel = isRecording
    ? "録音中… 離して送信"
    : isUploading
    ? "文字起こし中…"
    : label;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={disabled || isUploading}
        onPointerDown={(e) => {
          e.preventDefault();
          startRecording();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          if (isRecording) stopRecording();
        }}
        onPointerLeave={() => {
          if (isRecording) stopRecording();
        }}
        onPointerCancel={() => {
          if (isRecording) stopRecording();
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium select-none transition-colors ${SIZE_CLASSES[size]} ${buttonClass} disabled:opacity-50`}
        aria-label={label}
      >
        <MicIcon size={ICON_SIZE[size]} />
        <span>{displayLabel}</span>
      </button>
      {errorMsg && (
        <span className="text-xs text-red-500 max-w-xs break-words">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
