import { ptBR, type Dictionary } from "./pt-BR";

/**
 * Idioma único por enquanto (PT-BR). O ponto de acesso já é centralizado
 * para permitir troca de idioma no futuro sem mexer nos componentes.
 */
export const t: Dictionary = ptBR;

export type { Dictionary };
