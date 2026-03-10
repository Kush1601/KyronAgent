"use client";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const STYLES: Record<ToastType, string> = {
  success: "border-primary-300 text-primary-700 bg-primary-50",
  error: "border-red-300 text-red-700 bg-red-50",
  info: "border-blue-300 text-blue-700 bg-blue-50",
};

export function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={`fixed bottom-6 right-6 border rounded-xl px-4 py-3 text-sm max-w-xs z-50 transition-all duration-300 pointer-events-none shadow-md ${STYLES[toast.type]} ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {toast.message}
    </div>
  );
}
