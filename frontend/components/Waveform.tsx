"use client";

import { useEffect, useRef } from "react";

const BAR_W = 3;
const GAP = 4;
const FLAT = "#d1d5db";
const ACTIVE = "rgba(34, 197, 94, ";

export function Waveform({
  stream,
  active,
}: {
  stream: MediaStream | null;
  active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const analyser = useRef<AnalyserNode | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    if (!stream || !active) {
      cancelAnimationFrame(raf.current);
      analyser.current = null;
      const c2d = el.getContext("2d");
      if (!c2d) return;
      c2d.clearRect(0, 0, el.width, el.height);
      const bars = Math.floor(el.width / (BAR_W + GAP));
      for (let i = 0; i < bars; i++) {
        c2d.fillStyle = FLAT;
        c2d.beginPath();
        c2d.roundRect(i * (BAR_W + GAP), el.height / 2 - 2, BAR_W, 4, 2);
        c2d.fill();
      }
      return;
    }

    const audio = new AudioContext();
    ctx.current = audio;
    const ana = audio.createAnalyser();
    ana.fftSize = 128;
    analyser.current = ana;
    audio.createMediaStreamSource(stream).connect(ana);

    const freq = new Uint8Array(ana.frequencyBinCount);
    const c2d = el.getContext("2d")!;

    const draw = () => {
      ana.getByteFrequencyData(freq);
      c2d.clearRect(0, 0, el.width, el.height);

      const bars = Math.floor(el.width / (BAR_W + GAP));
      const step = Math.floor(freq.length / bars);

      for (let i = 0; i < bars; i++) {
        const val = freq[i * step] || 0;
        const h = Math.max(4, (val / 255) * (el.height - 8));
        const y = (el.height - h) / 2;
        const alpha = 0.5 + (val / 255) * 0.5;
        c2d.fillStyle = `${ACTIVE}${alpha})`;
        c2d.beginPath();
        c2d.roundRect(i * (BAR_W + GAP), y, BAR_W, h, 2);
        c2d.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      audio.close();
    };
  }, [stream, active]);

    return (
    <div className="h-20 rounded-xl bg-gray-50 border border-gray-300 flex items-center justify-center mb-5 px-4">
      {!stream && !active ? (
        <span className="text-gray-400 text-xs">Waveform appears while recording</span>
      ) : (
        <canvas ref={canvas} width={720} height={64} className="w-full h-full" />
      )}
    </div>
  );
}
