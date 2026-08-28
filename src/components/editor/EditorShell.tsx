"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PanelsTopLeft, SlidersHorizontal } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { EditorToolbar } from "@/components/editor/Toolbar/EditorToolbar";
import { Preview } from "@/components/editor/Preview/Preview";
import { Timeline } from "@/components/editor/Timeline/Timeline";
import { GuidedWizard } from "@/components/editor/GuidedMode/GuidedWizard";
import type { SceneTakes } from "@/components/editor/GuidedMode/TakePicker";
import type { MediaMeta } from "@/lib/editor/model/auto-assembly";
import { useEditorStore } from "@/stores/editorStore";
import { emptyTimeline, type AspectRatio } from "@/lib/editor/model/timeline";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type Mode = "guided" | "advanced";

export interface EditorShellProps {
  projectId: string;
  projectTitle: string;
  aspectRatio: AspectRatio;
  /** cenas com múltiplos takes (Fase 1 preenche a partir do banco) */
  scenes: SceneTakes[];
  media: MediaMeta[];
}

export function EditorShell({
  projectId,
  projectTitle,
  aspectRatio,
  scenes,
  media,
}: EditorShellProps) {
  const load = useEditorStore((s) => s.load);
  const [mode, setMode] = useState<Mode>("guided");

  useEffect(() => {
    load(projectId, emptyTimeline(aspectRatio));
  }, [projectId, aspectRatio, load]);

  return (
    <div className="editor-surface flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/projetos" aria-label="Voltar aos projetos">
            <Wordmark variant="paper" />
          </Link>
          <span className="text-sm text-muted">·</span>
          <span className="text-sm">{projectTitle}</span>
        </div>

        <div className="flex border border-editor-border" role="tablist" aria-label="Modo de edição">
          {(
            [
              ["guided", t.guided.modeLabel, PanelsTopLeft],
              ["advanced", t.guided.advancedModeLabel, SlidersHorizontal],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs",
                mode === value
                  ? "bg-white-pure text-ink"
                  : "text-muted hover:text-white-pure",
              )}
            >
              <Icon size={13} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {mode === "guided" ? (
          <div className="w-full max-w-xl border-r border-editor-border">
            <GuidedWizard
              aspectRatio={aspectRatio}
              scenes={scenes}
              media={media}
              onPreviewAsset={() => setMode("advanced")}
              onEnterFineTune={() => setMode("advanced")}
            />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <EditorToolbar />
          <Preview />
          <Timeline />
        </div>
      </div>
    </div>
  );
}
