"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEFAULT_ASPECT_BY_KIND, type AspectRatio } from "@/lib/editor/model/timeline";
import { requireProfile, type ActionState } from "./_shared";

export type ProjectKind = "social" | "client_presentation" | "lookbook" | "making_of";
export type ProjectStatus = "draft" | "in_review" | "approved" | "exported";

export interface ProjectRow {
  id: string;
  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  aspect_ratio: string;
  resolution: string;
  client_id: string | null;
  collection_id: string | null;
  duration_ms: number;
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export async function listProjects(): Promise<ProjectRow[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, kind, status, aspect_ratio, resolution, client_id, collection_id, duration_ms, thumbnail_path, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProjectRow[];
}

export async function getProject(projectId: string): Promise<ProjectRow | null> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, kind, status, aspect_ratio, resolution, client_id, collection_id, duration_ms, thumbnail_path, created_at, updated_at",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ProjectRow | null) ?? null;
}

const NewProjectSchema = z.object({
  title: z.string().trim().min(1, "Dê um título ao projeto."),
  kind: z.enum(["social", "client_presentation", "lookbook", "making_of"]),
  clientId: z.string().uuid().optional().or(z.literal("")),
  collectionId: z.string().uuid().optional().or(z.literal("")),
});

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = NewProjectSchema.safeParse({
    title: formData.get("title"),
    kind: formData.get("kind"),
    clientId: formData.get("clientId") ?? "",
    collectionId: formData.get("collectionId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { supabase, user, profile } = await requireProfile();
  const aspectRatio: AspectRatio = DEFAULT_ASPECT_BY_KIND[parsed.data.kind] ?? "9:16";

  const { data, error } = await supabase
    .from("projects")
    .insert({
      org_id: profile.org_id,
      title: parsed.data.title,
      kind: parsed.data.kind,
      client_id: parsed.data.clientId || null,
      collection_id: parsed.data.collectionId || null,
      aspect_ratio: aspectRatio,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Não foi possível criar o projeto." };

  revalidatePath("/projetos");
  redirect(`/editor/${data.id}`);
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/projetos");
}
