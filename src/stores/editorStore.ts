"use client";

import { create } from "zustand";
import {
  Timeline,
  emptyTimeline,
  type Clip,
  type Track,
  type AspectRatio,
} from "@/lib/editor/model/timeline";

/**
 * Estado do editor. Fonte de verdade da linha do tempo enquanto se edita.
 * O histórico (undo/redo) guarda snapshots imutáveis da `timeline`.
 * O autosave (debounce) fica na camada da rota, observando `isDirty`.
 */

const HISTORY_LIMIT = 50;

interface EditorState {
  projectId: string | null;
  timeline: Timeline;
  selectedClipId: string | null;
  /** posição do playhead na linha do tempo, em ms */
  playheadMs: number;
  isDirty: boolean;

  past: Timeline[];
  future: Timeline[];

  load: (projectId: string, timeline: Timeline) => void;
  reset: (aspectRatio?: AspectRatio) => void;

  selectClip: (clipId: string | null) => void;
  setPlayhead: (ms: number) => void;

  updateClip: (clipId: string, patch: Partial<Clip>) => void;
  removeClip: (clipId: string) => void;
  /** divide o clipe selecionado no ponto atual do playhead */
  splitAtPlayhead: () => void;
  moveClip: (clipId: string, toTrackId: string, startMs: number) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

function findClip(timeline: Timeline, clipId: string): { track: Track; clip: Clip } | null {
  for (const track of timeline.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function recomputeDuration(timeline: Timeline): number {
  let end = 0;
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      end = Math.max(end, clip.startMs + clip.durationMs);
    }
  }
  return end;
}

/** clona via schema para manter tudo válido e imutável entre snapshots */
function commit(
  state: EditorState,
  next: Timeline,
): Partial<EditorState> {
  const parsed = Timeline.parse({ ...next, durationMs: recomputeDuration(next) });
  return {
    past: [...state.past, state.timeline].slice(-HISTORY_LIMIT),
    future: [],
    timeline: parsed,
    isDirty: true,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  timeline: emptyTimeline(),
  selectedClipId: null,
  playheadMs: 0,
  isDirty: false,
  past: [],
  future: [],

  load: (projectId, timeline) =>
    set({
      projectId,
      timeline: Timeline.parse(timeline),
      selectedClipId: null,
      playheadMs: 0,
      isDirty: false,
      past: [],
      future: [],
    }),

  reset: (aspectRatio) =>
    set({
      timeline: emptyTimeline(aspectRatio),
      selectedClipId: null,
      playheadMs: 0,
      isDirty: true,
      past: [],
      future: [],
    }),

  selectClip: (clipId) => set({ selectedClipId: clipId }),
  setPlayhead: (ms) => set({ playheadMs: Math.max(0, ms) }),

  updateClip: (clipId, patch) => {
    const state = get();
    const next: Timeline = {
      ...state.timeline,
      tracks: state.timeline.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...patch } : clip,
        ),
      })),
    };
    set(commit(state, next));
  },

  removeClip: (clipId) => {
    const state = get();
    const next: Timeline = {
      ...state.timeline,
      tracks: state.timeline.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((clip) => clip.id !== clipId),
      })),
    };
    set({
      ...commit(state, next),
      selectedClipId:
        state.selectedClipId === clipId ? null : state.selectedClipId,
    });
  },

  splitAtPlayhead: () => {
    const state = get();
    const { selectedClipId, playheadMs, timeline } = state;
    if (!selectedClipId) return;
    const hit = findClip(timeline, selectedClipId);
    if (!hit) return;
    const { clip } = hit;
    const localMs = playheadMs - clip.startMs;
    if (localMs <= 0 || localMs >= clip.durationMs) return;

    const left: Clip = { ...clip, durationMs: localMs, outPointMs: clip.inPointMs + localMs };
    const right: Clip = {
      ...clip,
      id: crypto.randomUUID(),
      startMs: clip.startMs + localMs,
      durationMs: clip.durationMs - localMs,
      inPointMs: clip.inPointMs + localMs,
      transitionIn: { type: "none", durationMs: 0 },
    };

    const next: Timeline = {
      ...timeline,
      tracks: timeline.tracks.map((track) => ({
        ...track,
        clips: track.clips.flatMap((c) => (c.id === clip.id ? [left, right] : [c])),
      })),
    };
    set(commit(state, next));
  },

  moveClip: (clipId, toTrackId, startMs) => {
    const state = get();
    const hit = findClip(state.timeline, clipId);
    if (!hit) return;
    const moved: Clip = { ...hit.clip, startMs: Math.max(0, startMs) };

    const next: Timeline = {
      ...state.timeline,
      tracks: state.timeline.tracks.map((track) => {
        const withoutClip = track.clips.filter((c) => c.id !== clipId);
        if (track.id === toTrackId) {
          return {
            ...track,
            clips: [...withoutClip, moved].sort((a, b) => a.startMs - b.startMs),
          };
        }
        return { ...track, clips: withoutClip };
      }),
    };
    set(commit(state, next));
  },

  undo: () => {
    const state = get();
    const prev = state.past.at(-1);
    if (!prev) return;
    set({
      timeline: prev,
      past: state.past.slice(0, -1),
      future: [state.timeline, ...state.future].slice(0, HISTORY_LIMIT),
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    const nextTimeline = state.future[0];
    if (!nextTimeline) return;
    set({
      timeline: nextTimeline,
      past: [...state.past, state.timeline].slice(-HISTORY_LIMIT),
      future: state.future.slice(1),
      isDirty: true,
    });
  },

  markSaved: () => set({ isDirty: false }),
}));
