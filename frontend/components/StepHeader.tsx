"use client";

import type { StepStatus } from "@/lib/types";

const NUM_STYLES: Record<StepStatus, string> = {
  pending: "border border-gray-300 text-gray-400",
  active:
    "border border-primary-600 text-primary-600 shadow-[0_0_12px_rgba(88,124,232,0.3)]",
  done: "bg-primary-600 border-0 text-white",
};

export function StepHeader({
  num,
  title,
  sub,
  status,
}: {
  num: string;
  title: string;
  sub: string;
  status: StepStatus;
}) {
  return (
    <div className="flex items-center gap-3.5 mb-5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 transition-all duration-300 ${NUM_STYLES[status]}`}
      >
        {status === "done" ? "✓" : num}
      </div>
      <div>
        <h2
          className="text-2xl font-bold text-slate-950 tracking-tight"
        >
          {title}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
