"use client";

import { useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { formatTimecode, cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { Clip } from "@/lib/editor/model/timeline";

/** px por segundo na régua da linha do tempo */
const PX_PER_SEC = 48;
/** granularidade do encaixe ao arrastar/aparar, em ms */
const SNAP_MS = 100;
const MIN_CLIP_MS = 300;

type DragKind = "move" | "trim-start" | "trim-end";

interface DragState {
  kind: DragKind;
  clipId: string;
  trackId: string;
  originX: number;
  startMs: number;
  durationMs: number;
  inPointMs: number;
  /** valores provisórios exibidos durante o arraste */
  draftStartMs: number;
  draftDurationMs: number;
  draftInPointMs: number;
}

const snap = (ms: number) => Math.round(ms / SNAP_MS) * SNAP_MS;

export function Timeline() {
  const timeline = useEditorStore((s) => s.timeline);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const selectClip = useEditorStore((s) => s.selectClip);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const setPlayhead = useEditorStore((s) => s.setPlayhead);
  const moveClip = useEditorStore((s) => s.moveClip);
  const updateClip = useEditorStore((s) => s.updateClip);
  const seek = usePlaybackStore((s) => s.seek);

  const laneRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const totalMs = Math.max(timeline.durationMs, 10_000);
  const widthPx = (totalMs / 1000) * PX_PER_SEC;

  const msFromClientX = useCallback((clientX: number) => {
    const el = laneRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left + el.scrollLeft;
    return Math.max(0, (x / PX_PER_SEC) * 1000);
  }, []);

  function handleRulerPointerDown(e: React.PointerEvent) {
    const ms = msFromClientX(e.clientX);
    setPlayhead(ms);
    seek(ms);
  }

  function beginDrag(
    e: React.PointerEvent,
    kind: DragKind,
    clip: Clip,
    trackId: string,
  ) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    selectClip(clip.id);
    setDrag({
      kind,
      clipId: clip.id,
      trackId,
      originX: e.clientX,
      startMs: clip.startMs,
      durationMs: clip.durationMs,
      inPointMs: clip.inPointMs,
      draftStartMs: clip.startMs,
      draftDurationMs: clip.durationMs,
      draftInPointMs: clip.inPointMs,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const deltaMs = ((e.clientX - drag.originX) / PX_PER_SEC) * 1000;

    if (drag.kind === "move") {
      setDrag({ ...drag, draftStartMs: Math.max(0, snap(drag.startMs + deltaMs)) });
    } else if (drag.kind === "trim-end") {
      const next = Math.max(MIN_CLIP_MS, snap(drag.durationMs + deltaMs));
      setDrag({ ...drag, draftDurationMs: next });
    } else {
      // trim-start: encurta pelo começo, empurrando startMs e inPointMs juntos
      const shift = Math.min(
        snap(deltaMs),
        drag.durationMs - MIN_CLIP_MS,
      );
      const clampedShift = Math.max(shift, -drag.startMs, -drag.inPointMs);
      setDrag({
        ...drag,
        draftStartMs: drag.startMs + clampedShift,
        draftDurationMs: drag.durationMs - clampedShift,
        draftInPointMs: drag.inPointMs + clampedShift,
      });
    }
  }

  function onPointerUp() {
    if (!drag) return;
    if (drag.kind === "move" && drag.draftStartMs !== drag.startMs) {
      moveClip(drag.clipId, drag.trackId, drag.draftStartMs);
    } else if (
      drag.draftDurationMs !== drag.durationMs ||
      drag.draftStartMs !== drag.startMs
    ) {
      updateClip(drag.clipId, {
        startMs: drag.draftStartMs,
        durationMs: drag.draftDurationMs,
        inPointMs: drag.draftInPointMs,
        outPointMs: drag.draftInPointMs + drag.draftDurationMs,
      });
    }
    setDrag(null);
  }

  const ticks = Array.from({ length: Math.ceil(totalMs / 1000) + 1 }, (_, i) => i);

  return (
    <section
      aria-label={t.editor.timeline}
      className="flex min-h-0 flex-col border-t border-editor-border bg-editor"
    >
      <header className="flex items-center justify-between px-4 py-2 text-xs text-muted">
        <span className="eyebrow">{t.editor.timeline}</span>
        <span className="tabular">
          {formatTimecode(playheadMs)} / {formatTimecode(timeline.durationMs)}
        </span>
      </header>

      <div
        className="relative overflow-x-auto overflow-y-hidden"
        ref={laneRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ width: widthPx }} className="min-w-full select-none">
          <div
            className="relative h-6 cursor-text border-b border-editor-border"
            onPointerDown={handleRulerPointerDown}
          >
            {ticks.map((sec) => (
              <span
                key={sec}
                className="tabular absolute top-1 text-[10px] text-muted"
                style={{ left: sec * PX_PER_SEC }}
              >
                {sec % 5 === 0 ? formatTimecode(sec * 1000) : "·"}
              </span>
            ))}
          </div>

          <div className="divide-y divide-editor-border">
            {timeline.tracks.map((track) => (
              <div key={track.id} className="relative h-16">
                <span className="eyebrow absolute left-2 top-2 z-10 text-[10px]">
                  {track.name}
                </span>
                {track.clips.map((clip) => {
                  const isDragging = drag?.clipId === clip.id;
                  const startMs = isDragging ? drag.draftStartMs : clip.startMs;
                  const durationMs = isDragging
                    ? drag.draftDurationMs
                    : clip.durationMs;
                  const selected = clip.id === selectedClipId;
                  return (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-6 flex h-8 items-stretch border text-[11px]",
                        selected
                          ? "border-white-pure bg-gray-700 text-white-pure"
                          : "border-editor-border bg-gray-800 text-muted hover:border-gray-500",
                        isDragging && "opacity-80",
                      )}
                      style={{
                        left: (startMs / 1000) * PX_PER_SEC,
                        width: Math.max(12, (durationMs / 1000) * PX_PER_SEC),
                      }}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={t.guided.take.takeLabel}
                        onPointerDown={(e) => beginDrag(e, "trim-start", clip, track.id)}
                        className="w-1.5 shrink-0 cursor-ew-resize bg-white-pure/30"
                      />
                      <button
                        type="button"
                        onClick={() => selectClip(clip.id)}
                        onPointerDown={(e) => beginDrag(e, "move", clip, track.id)}
                        className="flex-1 cursor-grab overflow-hidden px-2 text-left leading-8 active:cursor-grabbing"
                      >
                        {clip.text?.text || clip.text?.preset || track.kind}
                      </button>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={t.editor.actions.trim}
                        onPointerDown={(e) => beginDrag(e, "trim-end", clip, track.id)}
                        className="w-1.5 shrink-0 cursor-ew-resize bg-white-pure/30"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-white-pure"
            style={{ left: (playheadMs / 1000) * PX_PER_SEC }}
          />
        </div>
      </div>
    </section>
  );
}
