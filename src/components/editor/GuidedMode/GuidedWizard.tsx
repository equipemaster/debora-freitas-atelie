"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { WizardStepper, type WizardStepMeta } from "./WizardStepper";
import { TakePicker, type SceneTakes } from "./TakePicker";
import { useEditorStore } from "@/stores/editorStore";
import {
  emptyWizardAnswers,
  type WizardAnswers,
} from "@/lib/editor/model/wizard";
import { buildTimeline, type MediaMeta } from "@/lib/editor/model/auto-assembly";
import type { AspectRatio } from "@/lib/editor/model/timeline";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const STEP_KEYS = [
  "project",
  "media",
  "chooseTake",
  "chooseMusic",
  "brandAndText",
  "autoAssembly",
  "fineTune",
  "export",
] as const;
type StepKey = (typeof STEP_KEYS)[number];

const STEPS: WizardStepMeta[] = STEP_KEYS.map((key) => ({
  key,
  label: t.guided.steps[key],
}));

export interface GuidedWizardProps {
  aspectRatio: AspectRatio;
  /** cenas com múltiplos takes, detectadas a partir de media_assets.scene_tag */
  scenes: SceneTakes[];
  media: MediaMeta[];
  onPreviewAsset: (assetId: string) => void;
  /** chamado quando a montagem automática termina e o vídeo abre para ajuste */
  onEnterFineTune: () => void;
}

export function GuidedWizard({
  aspectRatio,
  scenes,
  media,
  onPreviewAsset,
  onEnterFineTune,
}: GuidedWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(() => {
    const base = emptyWizardAnswers();
    base.takes = scenes.map((scene, i) => ({
      sceneTag: scene.sceneTag,
      chosenAssetIds: scene.options[0] ? [scene.options[0].assetId] : [],
      order: i,
    }));
    return base;
  });

  const loadTimeline = useEditorStore((s) => s.load);
  const projectId = useEditorStore((s) => s.projectId);

  const steps = STEPS;
  const stepKey: StepKey = STEP_KEYS[stepIndex];
  const isLast = stepIndex === STEP_KEYS.length - 1;

  function setTakeChoice(sceneTag: string, assetIds: string[]) {
    setAnswers((prev) => ({
      ...prev,
      takes: prev.takes.map((take) =>
        take.sceneTag === sceneTag ? { ...take, chosenAssetIds: assetIds } : take,
      ),
    }));
  }

  function runAutoAssembly() {
    const timeline = buildTimeline({ aspectRatio, answers, media });
    loadTimeline(projectId ?? "novo", timeline);
  }

  function goNext() {
    if (stepKey === "autoAssembly") runAutoAssembly();
    if (stepKey === "fineTune") {
      onEnterFineTune();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEP_KEYS.length - 1));
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-editor p-6 text-white-pure">
      <WizardStepper steps={steps} current={stepIndex} />

      <div>
        <p className="eyebrow mb-1">{steps[stepIndex].label}</p>
        <p className="max-w-prose text-sm text-muted">
          {t.guided.hints[stepKey]}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        {stepKey === "chooseTake" ? (
          scenes.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhuma cena tem mais de um take — seguimos direto para a música.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {scenes.map((scene) => {
                const choice = answers.takes.find(
                  (take) => take.sceneTag === scene.sceneTag,
                );
                return (
                  <TakePicker
                    key={scene.sceneTag}
                    scene={scene}
                    chosenIds={choice?.chosenAssetIds ?? []}
                    onChoose={(ids) => setTakeChoice(scene.sceneTag, ids)}
                    onPreview={onPreviewAsset}
                  />
                );
              })}
            </div>
          )
        ) : stepKey === "autoAssembly" ? (
          <div className="flex flex-col items-start gap-3">
            <Wand2 size={20} aria-hidden />
            <p className="text-sm text-muted">
              Ao avançar, montamos a linha do tempo com as suas escolhas.
            </p>
          </div>
        ) : (
          <div className="border border-dashed border-editor-border p-6 text-sm text-muted">
            Etapa em construção — o conteúdo interativo entra nas próximas
            iterações da Fase&nbsp;2.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-editor-border pt-4">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="flex items-center gap-2 text-xs text-muted hover:text-white-pure disabled:opacity-30"
        >
          <ArrowLeft size={14} aria-hidden />
          {t.common.back}
        </button>

        <Button variant="outline" onClick={goNext} className="!border-white-pure !text-white-pure hover:!bg-gray-800">
          {isLast ? t.common.finish : t.common.next}
          {!isLast ? <ArrowRight size={14} aria-hidden /> : null}
        </Button>
      </div>
    </div>
  );
}
