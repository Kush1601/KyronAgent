"use client";

type Variant = "idle" | "recording" | "paused" | "done" | "calling" | "error";

const STYLES: Record<Variant, { pill: string; dot: string; pulse?: boolean }> = {
  idle: { pill: "bg-gray-100 text-gray-600 border border-gray-300", dot: "bg-gray-400" },
  recording: { pill: "bg-red-100 text-red-700 border border-red-300", dot: "bg-red-500", pulse: true },
  paused: { pill: "bg-yellow-100 text-yellow-700 border border-yellow-300", dot: "bg-yellow-500" },
  done: { pill: "bg-primary-100 text-primary-700 border border-primary-300", dot: "bg-primary-500" },
  calling: { pill: "bg-blue-100 text-blue-700 border border-blue-300", dot: "bg-blue-500", pulse: true },
  error: { pill: "bg-red-100 text-red-700 border border-red-300", dot: "bg-red-500" },
};

export function StatusPill({ variant, label }: { variant: Variant; label: string }) {
  const s = STYLES[variant];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${s.pill}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}