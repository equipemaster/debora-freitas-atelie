import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/EditorShell";

export const metadata: Metadata = { title: "Editor" };

/**
 * Rota do editor. Por enquanto abre um projeto vazio no formato vertical —
 * a Fase 1 carrega o projeto real (título, formato, mídia, cenas/takes) do
 * Supabase a partir do `projectId`.
 */
export default async function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <EditorShell
      projectId={projectId}
      projectTitle="Projeto sem título"
      aspectRatio="9:16"
      scenes={[]}
      media={[]}
    />
  );
}
