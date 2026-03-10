"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { RecordStep } from "./RecordStep";
import { SetupStep } from "./SetupStep";
import { CallStep } from "./CallStep";
import { Toast } from "./Toast";
import type { SetupStep as SetupStepType } from "../lib/types";
import type { ToastState } from "./Toast";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
const bg = "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50";
const card = "bg-white border border-gray-200 rounded-2xl shadow-sm";
const input =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-500";

export function VoiceCloneApp() {
  const [name, setName] = useState("My Clone");
  const [customPhrase, setCustomPhrase] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState<SetupStepType>("idle");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    visible: false,
  });
  const lock = useRef(false);

  const notify = useCallback(
    (msg: string, type: ToastState["type"] = "info") => {
      setToast({ message: msg, type, visible: true });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
    },
    [],
  );

  useEffect(() => {
    if (!blob || lock.current) return;
    setup(blob);
  }, [blob]);

  const setup = async (audioBlob: Blob) => {
    if (lock.current) return;
    lock.current = true;

    setAgentId(null);
    setVoiceId(null);
    setErr(null);

    try {
      setStep("cloning-voice");
      const form = new FormData();
      form.append("audio", audioBlob, "sample.webm");
      form.append("voiceName", name || "My Clone");

      const res = await fetch(`${BACKEND_URL}/api/setup`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setStep("creating-agent");
      await new Promise((r) => setTimeout(r, 700));
      setStep("creating-prompt");
      await new Promise((r) => setTimeout(r, 700));

      setVoiceId(data.voiceId);
      setAgentId(data.agentId);
      setStep("ready");
      notify("Your voice clone is ready! 🎉", "success");
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      setStep("error");
      notify(`Setup failed: ${msg}`, "error");
    } finally {
      lock.current = false;
    }
  };

  const retry = () => {
    if (blob) {
      lock.current = false;
      setup(blob);
    }
  };

  const onRecord = (audioBlob: Blob) => {
    setBlob(audioBlob);
    lock.current = false;
    notify("Recording saved — building clone…", "info");
  };

  const recordStatus = blob ? "done" : "active";
  const setupStatus =
    step === "ready" ? "done" : step === "idle" ? "pending" : "active";
  const callStatus = agentId ? "active" : "pending";

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${bg}`}>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(45,158,127,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(27,94,63,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-6 pb-20">
        <header className="pt-12 pb-8 mb-10 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold text-green-700 mb-2">
                Vogen
              </h1>
              <p className="text-gray-600 text-sm">
                Your Persnalized AI Voice Agent
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="text-gray-600 text-xs font-medium">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Clone"
                  className={`${input} w-40`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Custom Phrase Input */}
        <div className={`${card} p-6 mb-8`}>
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-2">📖 Custom Phrase (15-20 seconds)</label>
            <textarea
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="Enter a phrase to read aloud, or leave blank for default..."
              className={`${input} min-h-20`}
            />
          </div>
        </div>

                <RecordStep onRecorded={onRecord} stepStatus={recordStatus} customPhrase={customPhrase} />
        <div className="h-px bg-gray-300 my-8" />

        <SetupStep setupStep={step} agentId={agentId} voiceId={voiceId} error={err} onRetry={retry} stepStatus={setupStatus} voiceName={name} />
        <div className="h-px bg-gray-300 my-8" />

        <CallStep agentId={agentId} stepStatus={callStatus} />
      </div>

      <Toast toast={toast} />
    </div>
  );
}
