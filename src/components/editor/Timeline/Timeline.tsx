"use client";

import { useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { formatTimecode, cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

/** px por segundo na régua da linha do tempo */
const PX_PER_SEC = 48;

export function Timeline() {
  const timeline = useEditorStore((s) => s.timeline);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const selectClip = useEditorStore((s) => s.selectClip);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const setPlayhead = useEditorStore((s) => s.setPlayhead);
  const seek = usePlaybackStore((s) => s.seek);

  const laneRef = useRef<HTMLDivElement>(null);

  const totalMs = Math.max(timeline.durationMs, 10_000);
  const widthPx = (totalMs / 1000) * PX_PER_SEC;

  function msFromClientX(clientX: number): number {
    const el = laneRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left + el.scrollLeft;
    return Math.max(0, (x / PX_PER_SEC) * 1000);
  }

  function handleRulerPointerDown(e: React.PointerEvent) {
    const ms = msFromClientX(e.clientX);
    setPlayhead(ms);
    seek(ms);
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

      <div className="relative overflow-x-auto overflow-y-hidden" ref={laneRef}>
        <div style={{ width: widthPx }} className="min-w-full">
          {/* régua */}
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

          {/* faixas */}
          <div className="divide-y divide-editor-border">
            {timeline.tracks.map((track) => (
              <div key={track.id} className="relative h-16">
                <span className="eyebrow absolute left-2 top-2 z-10 text-[10px]">
                  {track.name}
                </span>
                {track.clips.map((clip) => (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => selectClip(clip.id)}
                    className={cn(
                      "absolute top-6 h-8 overflow-hidden border px-2 text-left text-[11px] leading-8",
                      clip.id === selectedClipId
                        ? "border-white-pure bg-gray-700 text-white-pure"
                        : "border-editor-border bg-gray-800 text-muted hover:border-gray-500",
                    )}
                    style={{
                      left: (clip.startMs / 1000) * PX_PER_SEC,
                      width: Math.max(8, (clip.durationMs / 1000) * PX_PER_SEC),
                    }}
                  >
                    {clip.text?.text ?? track.kind}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* playhead */}
          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-white-pure"
            style={{ left: (playheadMs / 1000) * PX_PER_SEC }}
          />
        </div>
      </div>
    </section>
  );
}
