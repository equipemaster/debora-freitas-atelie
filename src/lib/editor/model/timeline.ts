import { z } from "zod";

/**
 * Modelo da linha do tempo — fonte de verdade do editor.
 * Serializado como JSONB em `projects.timeline` (com `timeline_version`).
 * Todo carregamento/salvamento passa por `TimelineSchema.parse`.
 */

export const TIMELINE_VERSION = 1;

export const AspectRatio = z.enum(["9:16", "1:1", "16:9", "4:5"]);
export type AspectRatio = z.infer<typeof AspectRatio>;

export const Resolution = z.enum(["720p", "1080p", "2160p"]);
export type Resolution = z.infer<typeof Resolution>;

export const TrackKind = z.enum(["video", "text", "overlay", "audio"]);
export type TrackKind = z.infer<typeof TrackKind>;

/** Transformações geométricas de um clipe visual (0..1 relativo ao quadro). */
export const Transform = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().positive().default(1),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
});
export type Transform = z.infer<typeof Transform>;

export const Keyframe = z.object({
  atMs: z.number().nonnegative(),
  transform: Transform.partial(),
  easing: z.enum(["linear", "ease-in", "ease-out", "ease-in-out"]).default("ease-in-out"),
});
export type Keyframe = z.infer<typeof Keyframe>;

export const Effect = z.object({
  id: z.string(),
  type: z.enum(["bw", "contrast", "grain", "blur", "vignette", "lut"]),
  amount: z.number().min(0).max(1).default(0.5),
  params: z.record(z.string(), z.number()).optional(),
});
export type Effect = z.infer<typeof Effect>;

export const Transition = z.object({
  type: z.enum(["none", "crossfade", "fade-black", "fade-white", "wipe"]).default("none"),
  durationMs: z.number().nonnegative().default(0),
});
export type Transition = z.infer<typeof Transition>;

/** Texto na tela — cartelas de título, legendas, ficha técnica da peça. */
export const TextContent = z.object({
  text: z.string(),
  preset: z
    .enum(["title-card", "lower-third", "caption", "tech-sheet", "end-card"])
    .default("caption"),
  fontFamily: z.enum(["display", "sans", "mono"]).default("display"),
  align: z.enum(["left", "center", "right"]).default("center"),
});
export type TextContent = z.infer<typeof TextContent>;

export const Clip = z.object({
  id: z.string(),
  /** referência a `media_assets.id`; ausente para clipes de texto puro */
  assetId: z.string().nullable().default(null),
  /** ponto de entrada/saída dentro da mídia de origem, em ms */
  inPointMs: z.number().nonnegative().default(0),
  outPointMs: z.number().nonnegative().default(0),
  /** início na linha do tempo, em ms */
  startMs: z.number().nonnegative(),
  /** duração efetiva na linha do tempo, em ms */
  durationMs: z.number().positive(),
  transform: Transform.prefault({}),
  effects: z.array(Effect).default([]),
  transitionIn: Transition.prefault({}),
  keyframes: z.array(Keyframe).default([]),
  text: TextContent.nullable().default(null),
  /** volume 0..1 para clipes com áudio */
  volume: z.number().min(0).max(1).default(1),
  muted: z.boolean().default(false),
});
export type Clip = z.infer<typeof Clip>;

export const Track = z.object({
  id: z.string(),
  kind: TrackKind,
  name: z.string().default(""),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  clips: z.array(Clip).default([]),
});
export type Track = z.infer<typeof Track>;

export const BrandBookends = z.object({
  intro: z.boolean().default(true),
  outro: z.boolean().default(true),
  /** template id em `templates`; null = usa o do brand kit */
  introTemplateId: z.string().nullable().default(null),
  outroTemplateId: z.string().nullable().default(null),
});
export type BrandBookends = z.infer<typeof BrandBookends>;

export const Timeline = z.object({
  version: z.literal(TIMELINE_VERSION).default(TIMELINE_VERSION),
  aspectRatio: AspectRatio.default("9:16"),
  resolution: Resolution.default("1080p"),
  fps: z.union([z.literal(24), z.literal(25), z.literal(30), z.literal(60)]).default(30),
  durationMs: z.number().nonnegative().default(0),
  brand: BrandBookends.prefault({}),
  tracks: z.array(Track).default([]),
});
export type Timeline = z.infer<typeof Timeline>;

/** Linha do tempo vazia para um projeto novo, já no formato do caso de uso. */
export function emptyTimeline(aspectRatio: AspectRatio = "9:16"): Timeline {
  return Timeline.parse({
    aspectRatio,
    tracks: [
      { id: crypto.randomUUID(), kind: "video", name: "Vídeo", clips: [] },
      { id: crypto.randomUUID(), kind: "text", name: "Texto", clips: [] },
      { id: crypto.randomUUID(), kind: "audio", name: "Música", clips: [] },
    ],
  });
}

/** Formato sugerido por caso de uso. */
export const DEFAULT_ASPECT_BY_KIND: Record<string, AspectRatio> = {
  social: "9:16",
  client_presentation: "16:9",
  lookbook: "4:5",
  making_of: "16:9",
};
