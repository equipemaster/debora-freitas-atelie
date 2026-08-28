"use client";

import { create } from "zustand";

/**
 * Estado de reprodução da prévia. Separado do editorStore porque muda a
 * cada frame durante o play e não deve entrar no histórico de undo.
 */
interface PlaybackState {
  playing: boolean;
  /** tempo atual da prévia, em ms */
  currentMs: number;
  /** duração conhecida da prévia, em ms (espelha timeline.durationMs) */
  durationMs: number;
  muted: boolean;

  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (ms: number) => void;
  setDuration: (ms: number) => void;
  setMuted: (muted: boolean) => void;
  /** avanço de um frame do relógio; chamado pelo loop de animação */
  tick: (deltaMs: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  playing: false,
  currentMs: 0,
  durationMs: 0,
  muted: false,

  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  toggle: () => set((s) => ({ playing: !s.playing })),

  seek: (ms) => {
    const { durationMs } = get();
    set({ currentMs: Math.min(Math.max(0, ms), durationMs || ms) });
  },

  setDuration: (ms) => set({ durationMs: Math.max(0, ms) }),
  setMuted: (muted) => set({ muted }),

  tick: (deltaMs) => {
    const { playing, currentMs, durationMs } = get();
    if (!playing) return;
    const next = currentMs + deltaMs;
    if (durationMs > 0 && next >= durationMs) {
      set({ currentMs: durationMs, playing: false });
    } else {
      set({ currentMs: next });
    }
  },
}));
