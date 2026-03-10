export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export type SetupStep = "idle" | "cloning-voice" | "creating-agent" | "creating-prompt" | "ready" | "error";

export type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

export type StepStatus = "pending" | "active" | "done";

export interface TranscriptItem {
  speaker: string;
  text: string;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}
