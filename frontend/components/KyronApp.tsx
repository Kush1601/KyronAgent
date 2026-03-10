"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RecordStep } from "./RecordStep";
import { SetupStep } from "./SetupStep";
import { CallStep } from "./CallStep";
import { Toast } from "./Toast";
import type { SetupStep as SetupStepType } from "@/lib/types";
import type { ToastState } from "./Toast";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
const bg = "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50";
const card = "bg-white border border-gray-200 rounded-2xl shadow-sm";
const inputClasses =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500";

export function KyronApp() {
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
      notify("Your Kyron agent is ready! 🎉", "success");
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
    notify("Recording saved — building your Kyron agent…", "info");
  };

  const recordStatus = blob ? "done" : "active";
  const setupStatus =
    step === "ready" ? "done" : step === "idle" ? "pending" : "active";
  const callStatus = agentId ? "active" : "pending";

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${bg}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 pb-20">
        <header className="pt-10 pb-8 mb-10 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/kyron_logo.png" alt="Kyron Medical" className="h-20 object-contain" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-400 to-primary-700 bg-[length:200%_auto] animate-shimmer">Kyron</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  AI-powered voice agents modernizing patient access &amp; insurance workflows.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <div>
                <label className="text-slate-500 text-xs font-medium block mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Clone"
                  className={`${inputClasses} w-48`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Custom Phrase Input */}
        <div className={`${card} p-6 mb-8 gradient-border-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-2">
              📖 Custom Phrase (15-20 seconds)
            </label>
            <textarea
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="Hi, this is a patient access agent from Kyron Medical calling..."
              className={`${inputClasses} min-h-20`}
            />
          </div>
        </div>

        <RecordStep
          onRecorded={onRecord}
          stepStatus={recordStatus}
          customPhrase={customPhrase}
        />
        <div className="h-px bg-gray-200 my-8 step-divider" />

        <SetupStep
          setupStep={step}
          agentId={agentId}
          voiceId={voiceId}
          error={err}
          onRetry={retry}
          stepStatus={setupStatus}
          voiceName={name}
        />
        <div className="h-px bg-gray-200 my-8 step-divider" />

        <CallStep agentId={agentId} stepStatus={callStatus} />
      </div>

      <Toast toast={toast} />
    </div>
  );
}
