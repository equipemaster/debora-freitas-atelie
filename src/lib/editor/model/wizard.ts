import { z } from "zod";

/**
 * Respostas do Modo Assistido — serializadas em `projects.wizard_answers`.
 * São reabríveis: a cliente pode voltar ao assistente e trocar um take/música
 * sem perder os ajustes manuais feitos depois (o Modo Avançado reconcilia).
 */

export const WIZARD_VERSION = 1;

export const MusicMood = z.enum([
  "elegante-lenta",
  "romantica",
  "energetica",
  "minimal",
  "sem-musica",
]);
export type MusicMood = z.infer<typeof MusicMood>;

/** Decisão de take para uma cena (grupo de `media_assets` com o mesmo scene_tag). */
export const TakeChoice = z.object({
  sceneTag: z.string(),
  /** ids de `media_assets` escolhidos; 1 = um take, 2+ = "usar os dois" */
  chosenAssetIds: z.array(z.string()).min(1),
  order: z.number().int().nonnegative(),
});
export type TakeChoice = z.infer<typeof TakeChoice>;

export const MusicChoice = z.object({
  /** id de `media_assets` (kind audio) ou template embutido; null = sem música */
  assetId: z.string().nullable().default(null),
  mood: MusicMood.default("elegante-lenta"),
  /** cortar as cenas no tempo da batida */
  cutOnBeat: z.boolean().default(true),
});
export type MusicChoice = z.infer<typeof MusicChoice>;

export const WizardAnswers = z.object({
  version: z.literal(WIZARD_VERSION).default(WIZARD_VERSION),
  takes: z.array(TakeChoice).default([]),
  music: MusicChoice.prefault({}),
  /** cliente marcou o assistente como concluído ao menos uma vez */
  completedOnce: z.boolean().default(false),
});
export type WizardAnswers = z.infer<typeof WizardAnswers>;

export function emptyWizardAnswers(): WizardAnswers {
  return WizardAnswers.parse({});
}
