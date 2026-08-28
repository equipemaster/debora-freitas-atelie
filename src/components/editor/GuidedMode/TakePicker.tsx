"use client";

import { Play, Check } from "lucide-react";
import { cn, formatTimecode } from "@/lib/utils";
import { t } from "@/lib/i18n";

export interface TakeOption {
  assetId: string;
  takeNumber: number;
  durationMs: number;
  posterUrl: string | null;
}

export interface SceneTakes {
  sceneTag: string;
  options: TakeOption[];
}

/**
 * A interação-assinatura do Modo Assistido: para uma cena com mais de um take,
 * mostra as opções lado a lado e pergunta qual usar. "Usar os dois" mantém
 * ambos, na ordem em que aparecem.
 */
export function TakePicker({
  scene,
  chosenIds,
  onChoose,
  onPreview,
}: {
  scene: SceneTakes;
  chosenIds: string[];
  onChoose: (assetIds: string[]) => void;
  onPreview: (assetId: string) => void;
}) {
  const allIds = scene.options.map((o) => o.assetId);
  const bothChosen = allIds.every((id) => chosenIds.includes(id));

  return (
    <div className="border border-editor-border">
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        <span className="eyebrow">
          {t.guided.take.sceneLabel} · {scene.sceneTag}
        </span>
        <button
          type="button"
          onClick={() => onChoose(bothChosen ? [allIds[0]] : allIds)}
          className={cn(
            "border border-editor-border px-2 py-1 text-[11px] text-white-pure hover:bg-gray-800",
            bothChosen && "bg-gray-700",
          )}
        >
          {t.guided.take.useBoth}
        </button>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {scene.options.map((opt) => {
          const chosen = chosenIds.includes(opt.assetId);
          return (
            <div
              key={opt.assetId}
              className={cn(
                "border",
                chosen ? "border-white-pure" : "border-editor-border",
              )}
            >
              <div className="relative flex aspect-video items-center justify-center bg-black">
                {opt.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opt.posterUrl}
                    alt={`${t.guided.take.takeLabel} ${opt.takeNumber}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="eyebrow text-gray-600">
                    {t.guided.take.takeLabel} {opt.takeNumber}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPreview(opt.assetId)}
                  aria-label={t.guided.take.preview}
                  className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center border border-white-pure/40 bg-black/60 text-white-pure"
                >
                  <Play size={12} aria-hidden />
                </button>
              </div>

              <div className="flex items-center justify-between px-3 py-2">
                <span className="tabular text-[11px] text-muted">
                  {t.guided.take.takeLabel} {opt.takeNumber} ·{" "}
                  {formatTimecode(opt.durationMs)}
                </span>
                <button
                  type="button"
                  onClick={() => onChoose([opt.assetId])}
                  className={cn(
                    "flex items-center gap-1 border px-2 py-1 text-[11px]",
                    chosen
                      ? "border-white-pure bg-white-pure text-ink"
                      : "border-editor-border text-white-pure hover:bg-gray-800",
                  )}
                >
                  {chosen ? <Check size={11} aria-hidden /> : null}
                  {t.guided.take.useThis}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
