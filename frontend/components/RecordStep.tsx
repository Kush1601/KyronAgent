"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { StepHeader } from "./StepHeader";
import { Waveform } from "./Waveform";
import { StatusPill } from "./StatusPill";
import type { RecordingState } from "@/lib/types";

const DEFAULT_TEXT = `The sun had barely risen over the hills when she decided to take the long road home. Every step was familiar — the creak of old wood, the scent of rain-soaked earth, the sound of birds waking in the trees.`;

const fmt = (s: number) => {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
};

type StepStatus = "pending" | "active" | "done";

export function RecordStep({
  onRecorded,
  stepStatus,
  customPhrase,
}: {
  onRecorded: (blob: Blob) => void;
  stepStatus: StepStatus;
  customPhrase: string;
}) {
  const [state, setState] = useState<RecordingState>("idle");
  const [secs, setSecs] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const str = useRef<MediaStream | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  useEffect(
    () => () => {
      stopTimer();
      str.current?.getTracks().forEach((t) => t.stop());
    },
    [stopTimer],
  );

  const start = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      str.current = ms;
      setStream(ms);
      chunks.current = [];

      const mr = new MediaRecorder(ms, { mimeType: "audio/webm" });
      rec.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setUrl(URL.createObjectURL(blob));
        onRecorded(blob);
        str.current?.getTracks().forEach((t) => t.stop());
        setStream(null);
      };

      mr.start(100);
      setSecs(0);
      stopTimer();

      // Auto-stop after 20 seconds
      timer.current = setInterval(
        () =>
          setSecs((s) => {
            const newSecs = s + 1;
            if (newSecs >= 20) {
              mr.stop();
              stopTimer();
              setState("stopped");
            }
            return newSecs;
          }),
        1000,
      );

      setState("recording");
    } catch {
      alert("Microphone access denied");
    }
  };

  const pause = () => {
    rec.current?.pause();
    stopTimer();
    setState("paused");
  };

  const resume = () => {
    rec.current?.resume();
    timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
    setState("recording");
  };

  const stop = () => {
    rec.current?.stop();
    stopTimer();
    setState("stopped");
  };

  const reset = () => {
    setUrl(null);
    setSecs(0);
    setState("idle");
    setStream(null);
  };

  const variant =
    state === "recording"
      ? "recording"
      : state === "paused"
        ? "paused"
        : state === "stopped"
          ? "done"
          : "idle";
  const label =
    state === "recording"
      ? "● Recording"
      : state === "paused"
        ? "⏸ Paused"
        : state === "stopped"
          ? "Saved ✓"
          : "Waiting";
  const text = customPhrase || DEFAULT_TEXT;

  return (
    <div
      className="mb-8 animate-fade-up"
      style={{ animationDelay: "0.05s", opacity: 0 }}
    >
      <StepHeader
        num="01"
        title="Record Your Voice"
        sub="Read aloud — 15-20 seconds"
        status={stepStatus}
      />
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 gradient-border-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
          <span className="text-xs tracking-widest uppercase text-primary-700 mb-2.5 block font-mono font-semibold">
            📖 Read this
          </span>
          <p className="text-lg leading-relaxed text-slate-800">{text}</p>
        </div>

        <Waveform stream={stream} active={state === "recording"} />

        <div className="text-center mb-5">
          <span className="text-6xl tracking-widest font-mono text-primary-700">
            {fmt(secs).split(":")[0]}
            <span className="animate-pulse">:</span>
            {fmt(secs).split(":")[1]}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {state === "idle" && (
            <button
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all animate-morph-pulse"
              onClick={start}
            >
              <span>⏺</span> Start
            </button>
          )}
          {state === "recording" && (
            <>
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-all font-medium"
                onClick={pause}
              >
                ⏸ Pause
              </button>
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-all font-medium"
                onClick={stop}
              >
                ⏹ Save
              </button>
            </>
          )}
          {state === "paused" && (
            <>
              <button
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all"
                onClick={resume}
              >
                ▶ Resume
              </button>
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-all font-medium"
                onClick={stop}
              >
                ⏹ Save
              </button>
            </>
          )}
          {state === "stopped" && (
            <button
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/20 transition-all"
              onClick={reset}
            >
              ↺ Re-record
            </button>
          )}
        </div>

        {url && state === "stopped" && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 mb-4">
            <span className="text-primary-600">▶</span>
            <audio controls src={url} className="flex-1 h-7" />
          </div>
        )}

        <StatusPill variant={variant} label={label} />
      </div>
    </div>
  );
}
