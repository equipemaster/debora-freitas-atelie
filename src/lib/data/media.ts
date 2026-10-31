"use server";

import type { MediaMeta } from "@/lib/editor/model/auto-assembly";
import type { SceneTakes, TakeOption } from "@/components/editor/GuidedMode/TakePicker";
import { requireProfile } from "./_shared";

const POSTER_URL_TTL_SECONDS = 60 * 60; // 1h — suficiente pra uma sessão de edição

/**
 * Mídia de um projeto, no formato que `EditorShell`/`auto-assembly.ts` já
 * esperam (ver `lib/editor/model/auto-assembly.ts` e
 * `components/editor/GuidedMode/TakePicker.tsx`) — quem carregar o projeto
 * no editor consome isto direto, sem remapear nada.
 */
export async function listMediaForProject(projectId: string): Promise<MediaMeta[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, kind, scene_tag, take_number, duration_ms")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    sceneTag: row.scene_tag,
    takeNumber: row.take_number,
    durationMs: row.duration_ms ?? 0,
  }));
}

/**
 * Agrupa a mídia de vídeo por `scene_tag` e gera URL assinada do poster de
 * cada take — pronto pro `TakePicker` do Modo Assistido. Cenas com um único
 * take não geram pergunta (ver CLAUDE.md seção 7); aqui devolvemos todas e
 * quem consome decide o que perguntar.
 */
export async function listScenesForProject(projectId: string): Promise<SceneTakes[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, scene_tag, take_number, duration_ms, poster_path")
    .eq("project_id", projectId)
    .eq("kind", "video")
    .not("scene_tag", "is", null)
    .order("take_number", { ascending: true });

  if (error) throw new Error(error.message);

  const bySceneTag = new Map<string, typeof data>();
  for (const row of data ?? []) {
    const key = row.scene_tag as string;
    const bucket = bySceneTag.get(key) ?? [];
    bucket.push(row);
    bySceneTag.set(key, bucket);
  }

  const scenes: SceneTakes[] = [];
  for (const [sceneTag, rows] of bySceneTag) {
    const options: TakeOption[] = await Promise.all(
      rows.map(async (row): Promise<TakeOption> => {
        let posterUrl: string | null = null;
        if (row.poster_path) {
          const { data: signed } = await supabase.storage
            .from("thumbnails")
            .createSignedUrl(row.poster_path, POSTER_URL_TTL_SECONDS);
          posterUrl = signed?.signedUrl ?? null;
        }
        return {
          assetId: row.id,
          takeNumber: row.take_number ?? 1,
          durationMs: row.duration_ms ?? 0,
          posterUrl,
        };
      }),
    );
    scenes.push({ sceneTag, options });
  }

  return scenes;
}
