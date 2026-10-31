"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProfile, type ActionState } from "./_shared";

export interface CollectionRow {
  id: string;
  name: string;
  season: string | null;
  year: number | null;
  description: string | null;
  cover_path: string | null;
  created_at: string;
}

export async function listCollections(): Promise<CollectionRow[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, season, year, description, cover_path, created_at")
    .order("year", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CollectionRow[];
}

const NewCollectionSchema = z.object({
  name: z.string().trim().min(1, "Digite o nome da coleção."),
  season: z.string().trim().optional(),
  year: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 2000 && v < 2100), {
      message: "Ano inválido.",
    }),
  description: z.string().trim().optional(),
});

export async function createCollectionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = NewCollectionSchema.safeParse({
    name: formData.get("name"),
    season: formData.get("season") ?? "",
    year: formData.get("year") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { supabase, profile } = await requireProfile();
  const { error } = await supabase.from("collections").insert({
    org_id: profile.org_id,
    name: parsed.data.name,
    season: parsed.data.season || null,
    year: parsed.data.year ?? null,
    description: parsed.data.description || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/colecoes");
  return { error: null };
}

export async function deleteCollectionAction(collectionId: string): Promise<void> {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("collections").delete().eq("id", collectionId);
  if (error) throw new Error(error.message);
  revalidatePath("/colecoes");
}
