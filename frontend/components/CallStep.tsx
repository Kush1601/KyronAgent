"use client";

import { useState, useRef, useEffect } from "react";
import { StepHeader } from "./StepHeader";
import { StatusPill } from "./StatusPill";
import type { CallState, TranscriptItem } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
const avatar = {
  user: "rgba(219,234,254,1)",
  agent: "linear-gradient(135deg, #059669, #047857)",
};
type StepStatus = "pending" | "active" | "done";

export function CallStep({
  agentId,
  stepStatus,
}: {
  agentId: string | null;
  stepStatus: StepStatus;
}) {
  const [state, setState] = useState<CallState>("idle");
  const [msgs, setMsgs] = useState<TranscriptItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [timer, setTimer] = useState(300); // 5 min cap

  const call = useRef<any>(null);
  const unsub = useRef<(() => void) | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const countDown = useRef<NodeJS.Timeout | null>(null);
  const originalError = useRef<any>(null);


  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs]);

  // Countdown timer - hard limit at 0
  useEffect(() => {
    if (state === "connected" && timer > 0) {
      countDown.current = setInterval(
        () =>
          setTimer((t) => {
            if (t <= 1) {
              // Force hangup at 0
              setTimeout(() => hangup(), 100);
              return 0;
            }
            return t - 1;
          }),
        1000,
      );
    }
    return () => {
      if (countDown.current) clearInterval(countDown.current);
    };
  }, [state, timer]);

  const fmt = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  const start = async () => {
    if (!agentId) return;
    setErr(null);
    setState("connecting");
    setMsgs([]);
    setTimer(300);

    try {
      const { VogentCall } = await import("@vogent/vogent-web-client");

      // Suppress DataChannel console errors
      originalError.current = console.error;
      console.error = (...args: any[]) => {
        if (args[0]?.includes?.("DataChannel") || JSON.stringify(args[0])?.includes?.("DataChannel")) {
          return;
        }
        originalError.current?.(...args);
      };

      const res = await fetch(`${BACKEND_URL}/api/dial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const { dialToken, sessionId, dialId } = await res.json();

      const c = new VogentCall({ sessionId, dialId, token: dialToken });
      call.current = c;

      await c.start();
      await c.connectAudio();

      unsub.current = c.monitorTranscript((items: TranscriptItem[]) => {
        setMsgs([...items]);

        // Check if user said bye/goodbye to end call
        const lastMsg = items[items.length - 1];
        if (lastMsg && lastMsg.speaker === "HUMAN") {
          const text = lastMsg.text.toLowerCase();
          if (text.includes("bye") || text.includes("goodbye")) {
            setTimeout(() => {
              hangup();
            }, 1000);
          }
        }
      });
      c.on("status", (s: string) => {
        if (s === "connected") setState("connected");
        else if (s === "ended" || s === "error") end(s as CallState);
      });

      // Suppress DataChannel warnings in console
      if (window.console) {
        const originalWarn = console.warn;
        console.warn = (...args: any[]) => {
          if (args[0]?.includes?.("DataChannel")) return;
          originalWarn(...args);
        };
      }
    } catch (e) {
      setErr((e as Error).message);
      setState("error");
    }
  };

  const toggle = async () => {
    if (!call.current) return;
    const next = !paused;
    await call.current.setPaused(next);
    setPaused(next);
  };

  const hangup = async () => {
    unsub.current?.();
    await call.current?.hangup().catch(() => {});
    call.current = null;
    end("ended");
    
    // Restore original console.error
    if (originalError.current) {
      console.error = originalError.current;
    }
  };
  const end = (reason: CallState) => {
    setState(reason);
    setPaused(false);
    unsub.current?.();
    call.current = null;
    if (countDown.current) clearInterval(countDown.current);
  };

  const variant =
    state === "connecting" || state === "connected"
      ? "calling"
      : state === "error"
        ? "error"
        : "idle";
  const label =
    state === "connecting"
      ? "connecting…"
      : state === "connected"
        ? `live • ${fmt(timer)}`
        : state === "ended"
          ? "ended"
          : state === "error"
            ? "error"
            : "idle";

  return (
    <div
      className="mb-8 animate-fade-up"
      style={{ animationDelay: "0.25s", opacity: 0 }}
    >
      <StepHeader
        num="03"
        title="Talk to Your Clone"
        sub="Chat with yourself for 5 minutes"
        status={stepStatus}
      />
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div
          ref={box}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 min-h-[200px] max-h-[360px] overflow-y-auto mb-5"
        >
          {msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
              <span className="text-3xl opacity-50">💬</span>
              <span className="text-sm">Conversation appears here</span>
            </div>
          ) : (
            msgs.map((item, i) => {
              const isAgent = item.speaker === "AI" || item.speaker === "agent";
              return (
                <div
                  key={i}
                  className="flex gap-2.5 mb-3.5 items-start animate-fade-up"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                    style={{
                      background: isAgent ? avatar.agent : avatar.user,
                      color: isAgent ? "white" : "#1f2937",
                    }}
                  >
                    {isAgent ? "🤖" : "👤"}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-semibold">
                      {isAgent ? "clone" : "you"}
                    </div>
                    <div
                      className={`px-3.5 py-2.5 rounded-xl text-sm leading-snug border ${isAgent ? "bg-green-50 border-green-200 text-gray-900" : "bg-blue-50 border-blue-200 text-gray-900"}`}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {err && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {err}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1">
            <StatusPill variant={variant} label={label} />
          </div>

          {(state === "idle" || state === "ended" || state === "error") && (
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
              onClick={start}
              disabled={!agentId}
            >
              <span>📞</span> {state === "ended" ? "Call Again" : "Call Clone"}
            </button>
          )}

          {state === "connecting" && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium"
              disabled
            >
              <span className="w-3 h-3 rounded-full border-2 border-green-300 border-t-white animate-spin inline-block mr-2" />
              Connecting…
            </button>
          )}

          {state === "connected" && (
            <>
              <button
                className={`px-4 py-2 rounded-xl font-medium transition-all ${paused ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"}`}
                onClick={toggle}
              >
                {paused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl border border-red-300 transition-all font-medium"
                onClick={hangup}
              >
                📵 Hang Up
              </button>
            </>
          )}
        </div>

        {!agentId && (
          <p className="text-xs text-gray-500 mt-3">
            ↑ Complete steps 1–2 first
          </p>
        )}
      </div>
    </div>
  );
}

