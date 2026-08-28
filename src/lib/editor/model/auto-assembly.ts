import {
  Timeline,
  emptyTimeline,
  type AspectRatio,
  type Clip,
} from "./timeline";
import type { WizardAnswers } from "./wizard";

/**
 * Montagem automática da linha do tempo.
 *
 * Função **pura e testável**: recebe as respostas do assistente + os metadados
 * das mídias e devolve uma `Timeline` completa (ordem das cenas, cortes no tempo
 * da música, ducking do áudio original, abertura/encerramento da marca).
 *
 * O resultado é sempre editável no Modo Avançado — esta função nunca é a última
 * palavra, só o ponto de partida.
 *
 * TODO (Fase 2):
 *  - respeitar `music.cutOnBeat` usando os beats detectados da faixa
 *  - distribuir a duração entre cenas conforme número de takes e clima
 *  - inserir transições curtas entre cenas quando `mood` não for "energetica"
 *  - aplicar template de abertura/encerramento do brand kit
 */
export interface MediaMeta {
  id: string;
  kind: "video" | "image" | "audio";
  sceneTag: string | null;
  takeNumber: number | null;
  durationMs: number;
}

export interface AutoAssemblyInput {
  aspectRatio: AspectRatio;
  answers: WizardAnswers;
  media: MediaMeta[];
  /** duração-alvo aproximada do corte, em ms (derivada do caso de uso/música) */
  targetDurationMs?: number;
}

export function buildTimeline(input: AutoAssemblyInput): Timeline {
  const { aspectRatio, answers, media } = input;
  const timeline = emptyTimeline(aspectRatio);

  const byId = new Map(media.map((m) => [m.id, m]));
  const videoTrack = timeline.tracks.find((track) => track.kind === "video");
  if (!videoTrack) return timeline;

  let cursorMs = 0;
  const orderedTakes = [...answers.takes].sort((a, b) => a.order - b.order);

  for (const take of orderedTakes) {
    for (const assetId of take.chosenAssetIds) {
      const meta = byId.get(assetId);
      if (!meta || meta.kind === "audio") continue;

      const durationMs = meta.durationMs > 0 ? meta.durationMs : 3000;
      const clip: Clip = {
        id: crypto.randomUUID(),
        assetId,
        inPointMs: 0,
        outPointMs: durationMs,
        startMs: cursorMs,
        durationMs,
        transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
        effects: [],
        transitionIn: { type: "none", durationMs: 0 },
        keyframes: [],
        text: null,
        volume: 1,
        muted: false,
      };
      videoTrack.clips.push(clip);
      cursorMs += durationMs;
    }
  }

  // Música na faixa de áudio, cobrindo toda a duração.
  const audioTrack = timeline.tracks.find((track) => track.kind === "audio");
  if (audioTrack && answers.music.assetId) {
    audioTrack.clips.push({
      id: crypto.randomUUID(),
      assetId: answers.music.assetId,
      inPointMs: 0,
      outPointMs: cursorMs,
      startMs: 0,
      durationMs: Math.max(cursorMs, 1),
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
      effects: [],
      transitionIn: { type: "none", durationMs: 0 },
      keyframes: [],
      text: null,
      volume: 0.6,
      muted: false,
    });
  }

  timeline.durationMs = cursorMs;
  return Timeline.parse(timeline);
}
