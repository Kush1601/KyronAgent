"use client";

import { StepHeader } from "./StepHeader";
import type { SetupStep } from "@/lib/types";

type StepStatus = "pending" | "active" | "done";

const STEPS: { key: SetupStep; label: string; sub: string }[] = [
  { key: "cloning-voice", label: "Cloning voice", sub: "POST /api/setup" },
  { key: "creating-agent", label: "Creating agent", sub: "Vogent API" },
  { key: "creating-prompt", label: "Writing personality", sub: "AI model setup" },
  { key: "ready", label: "Ready", sub: "Agent ready to call" },
];

const status = (step: SetupStep, current: SetupStep): "done" | "active" | "pending" => {
  const order: SetupStep[] = ["idle", "cloning-voice", "creating-agent", "creating-prompt", "ready", "error"];
  const idx = order.indexOf(step);
  const cur = order.indexOf(current);
  return cur > idx ? "done" : cur === idx ? "active" : "pending";
};

const colors = {
  done: { border: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.05)", text: "#059669", icon: "rgba(34,197,94,0.2)" },
  active: { border: "rgba(34,197,94,1)", bg: "rgba(34,197,94,0.08)", text: "rgb(5,150,105)", icon: "rgba(34,197,94,0.2)" },
  pending: { border: "rgb(209,213,219)", bg: "transparent", text: "rgb(107,114,128)", icon: "rgba(107,114,128,0.1)" }
};

export function SetupStep({ setupStep, agentId, voiceId, error, onRetry, stepStatus, voiceName }: {
  setupStep: SetupStep; agentId: string | null; voiceId: string | null; error: string | null; onRetry: () => void; stepStatus: StepStatus; voiceName: string;
}) {
  const idle = setupStep === "idle";
  const running = ["cloning-voice", "creating-prompt", "creating-agent"].includes(setupStep);
  const done = setupStep === "ready";
  const fail = setupStep === "error";

  return (
    <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
      <StepHeader num="02" title="Build Your Clone" sub="Automatic: voice → agent → ready" status={stepStatus} />
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        {idle && (
          <div className="text-center py-6">
            <div className="text-5xl mb-3 opacity-50">🔄</div>
            <p className="text-gray-600 text-sm">Runs automatically after recording</p>
          </div>
        )}

        {(running || done) && (
          <div className="space-y-3 mb-4">
            {STEPS.map(({ key, label, sub }) => {
              const st = status(key, setupStep);
              const col = st === "done" ? colors.done : st === "active" ? colors.active : colors.pending;

              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl border transition-all" style={{ borderColor: col.border, backgroundColor: col.bg, opacity: st === "pending" ? 0.4 : 1 }}>
                  <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-xs" style={{ background: col.icon }}>
                    {st === "done" ? "✓" : st === "active" ? <span className="w-3 h-3 rounded-full border-2 border-green-300 border-t-green-600 animate-spin" /> : "○"}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: col.text }}>{label}</div>
                    <div className="text-xs text-gray-500">{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {done && agentId && (
          <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl mt-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>🤖</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">{voiceName} Clone</div>
              <div className="text-xs text-gray-600 font-mono mt-0.5 truncate">id: {agentId}</div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0 font-semibold">ready</span>
          </div>
        )}

        {fail && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Failed:</strong> {error}
            </div>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-all font-medium" onClick={onRetry}>↺ Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}