"use client";

import { Play, Pause } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { formatTimecode } from "@/lib/utils";
import { t } from "@/lib/i18n";

const ASPECT_CLASS: Record<string, string> = {
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
};

/**
 * Superfície de prévia. O compositor real (Canvas/WebGL + Web Audio) entra na
 * Fase 2 — por ora mostra o quadro no formato certo e os controles de transporte.
 */
export function Preview() {
  const aspectRatio = useEditorStore((s) => s.timeline.aspectRatio);
  const durationMs = useEditorStore((s) => s.timeline.durationMs);
  const playheadMs = useEditorStore((s) => s.playheadMs);

  const playing = usePlaybackStore((s) => s.playing);
  const toggle = usePlaybackStore((s) => s.toggle);

  return (
    <section
      aria-label={t.editor.preview}
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-editor p-6"
    >
      <div
        className={`relative flex items-center justify-center border border-editor-border bg-black ${
          ASPECT_CLASS[aspectRatio] ?? "aspect-video"
        }`}
        style={{ height: "min(60vh, 640px)" }}
      >
        <span className="eyebrow text-gray-500">{t.editor.preview}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Reproduzir"}
          className="flex h-10 w-10 items-center justify-center border border-editor-border text-white-pure hover:bg-gray-800"
        >
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
        </button>
        <span className="tabular text-xs text-muted">
          {formatTimecode(playheadMs)} / {formatTimecode(durationMs)}
        </span>
      </div>
    </section>
  );
}
