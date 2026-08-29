import { Timeline, emptyTimeline, type AspectRatio, type Clip } from "./timeline";
import type { WizardAnswers, MusicMood } from "./wizard";

/**
 * Montagem automática da linha do tempo.
 *
 * Função **pura e testável**: recebe as respostas do assistente + os metadados
 * das mídias e devolve uma `Timeline` completa — ordem das cenas, cortes no
 * tempo da batida, ducking do áudio original, abertura/encerramento da marca.
 *
 * O resultado é sempre editável no Modo Avançado — esta função nunca é a última
 * palavra, só o ponto de partida.
 */

export const INTRO_MS = 1600;
export const OUTRO_MS = 2000;
export const CROSSFADE_MS = 320;
export const MIN_SCENE_MS = 1200;
/** volume do áudio original das cenas quando há trilha por cima */
export const DUCKED_VOLUME = 0.35;

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
  /** duração-alvo aproximada do corte de conteúdo (sem abertura/encerramento) */
  targetDurationMs?: number;
  /** posições de batida da trilha, em ms — usadas quando `music.cutOnBeat` */
  beatsMs?: number[];
  /** dados da marca para as cartelas de abertura/encerramento */
  brand?: { name?: string };
}

/** Transição entre cenas conforme o clima escolhido. */
export function transitionForMood(mood: MusicMood): Clip["transitionIn"] {
  switch (mood) {
    case "energetica":
    case "minimal":
    case "sem-musica":
      return { type: "none", durationMs: 0 };
    default:
      return { type: "crossfade", durationMs: CROSSFADE_MS };
  }
}

/**
 * Redistribui as durações de origem para somar ~`targetMs`, respeitando um
 * mínimo por clipe. Sem alvo, devolve as durações originais (com piso).
 */
export function distributeDurations(
  sourceDurations: number[],
  targetMs?: number,
): number[] {
  const floored = sourceDurations.map((d) => Math.max(MIN_SCENE_MS, Math.round(d || MIN_SCENE_MS)));
  if (!targetMs || floored.length === 0) return floored;

  const total = floored.reduce((a, b) => a + b, 0);
  const scale = targetMs / total;
  return floored.map((d) => Math.max(MIN_SCENE_MS, Math.round(d * scale)));
}

/** Ajusta os pontos de corte acumulados para a batida mais próxima. */
export function snapToBeats(cutPoints: number[], beatsMs: number[]): number[] {
  if (beatsMs.length === 0) return cutPoints;
  const sorted = [...beatsMs].sort((a, b) => a - b);
  return cutPoints.map((cut) => {
    let nearest = sorted[0];
    for (const beat of sorted) {
      if (Math.abs(beat - cut) < Math.abs(nearest - cut)) nearest = beat;
    }
    return nearest;
  });
}

function makeClip(partial: Partial<Clip> & Pick<Clip, "startMs" | "durationMs">): Clip {
  return {
    id: crypto.randomUUID(),
    assetId: null,
    inPointMs: 0,
    outPointMs: partial.durationMs,
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    effects: [],
    transitionIn: { type: "none", durationMs: 0 },
    keyframes: [],
    text: null,
    volume: 1,
    muted: false,
    ...partial,
  };
}

export function buildTimeline(input: AutoAssemblyInput): Timeline {
  const { aspectRatio, answers, media, targetDurationMs, beatsMs, brand } = input;
  const timeline = emptyTimeline(aspectRatio);

  const byId = new Map(media.map((m) => [m.id, m]));
  const videoTrack = timeline.tracks.find((t) => t.kind === "video");
  const audioTrack = timeline.tracks.find((t) => t.kind === "audio");
  if (!videoTrack) return timeline;

  const hasMusic =
    !!answers.music.assetId && answers.music.mood !== "sem-musica";
  const transition = transitionForMood(answers.music.mood);

  // 1. resolve os assets de conteúdo na ordem das cenas
  const orderedTakes = [...answers.takes].sort((a, b) => a.order - b.order);
  const contentAssets = orderedTakes
    .flatMap((take) => take.chosenAssetIds)
    .map((id) => byId.get(id))
    .filter((m): m is MediaMeta => !!m && m.kind !== "audio");

  // 2. distribui durações e calcula pontos de corte
  const durations = distributeDurations(
    contentAssets.map((m) => m.durationMs),
    targetDurationMs,
  );

  let cutPoints: number[] = [];
  let acc = 0;
  for (const d of durations) {
    acc += d;
    cutPoints.push(acc);
  }
  if (answers.music.cutOnBeat && beatsMs && beatsMs.length > 0) {
    cutPoints = snapToBeats(cutPoints, beatsMs);
  }

  // 3. cartela de abertura da marca
  const introOn = timeline.brand.intro;
  const outroOn = timeline.brand.outro;
  let cursor = 0;
  if (introOn) {
    videoTrack.clips.push(
      makeClip({
        startMs: 0,
        durationMs: INTRO_MS,
        text: {
          text: brand?.name ?? "",
          preset: "title-card",
          fontFamily: "display",
          align: "center",
        },
      }),
    );
    cursor = INTRO_MS;
  }

  // 4. clipes de conteúdo
  let prevCut = 0;
  contentAssets.forEach((meta, i) => {
    const endCut = cutPoints[i] ?? prevCut + durations[i];
    const durationMs = Math.max(MIN_SCENE_MS, endCut - prevCut);
    prevCut = endCut;

    videoTrack.clips.push(
      makeClip({
        assetId: meta.id,
        startMs: cursor,
        durationMs,
        inPointMs: 0,
        outPointMs: Math.min(durationMs, meta.durationMs || durationMs),
        transitionIn: i === 0 ? { type: "none", durationMs: 0 } : transition,
        volume: hasMusic ? DUCKED_VOLUME : 1,
      }),
    );
    cursor += durationMs;
  });

  // 5. cartela de encerramento
  if (outroOn) {
    videoTrack.clips.push(
      makeClip({
        startMs: cursor,
        durationMs: OUTRO_MS,
        text: {
          text: brand?.name ?? "",
          preset: "end-card",
          fontFamily: "display",
          align: "center",
        },
      }),
    );
    cursor += OUTRO_MS;
  }

  // 6. trilha cobrindo tudo
  if (audioTrack && hasMusic && answers.music.assetId) {
    audioTrack.clips.push(
      makeClip({
        assetId: answers.music.assetId,
        startMs: 0,
        durationMs: Math.max(cursor, 1),
        outPointMs: Math.max(cursor, 1),
        volume: 0.7,
      }),
    );
  }

  timeline.durationMs = cursor;
  return Timeline.parse(timeline);
}
