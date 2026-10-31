import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Toda Server Action/consulta de dados começa por aqui: garante sessão válida
 * e devolve o `org_id` da usuária (a organização é única por enquanto — ver
 * CLAUDE.md seção 11). RLS ainda é a defesa de verdade; isso só evita repetir
 * o boilerplate de "pegar usuária + perfil" em cada arquivo de `lib/data`.
 */
export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("org_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    throw new Error("Perfil não encontrado. Saia e entre de novo — se persistir, avise o suporte.");
  }

  return { supabase, user, profile };
}

/** Estado padrão devolvido pelas Server Actions de formulário (useActionState). */
export type ActionState = { error: string | null };
export const initialActionState: ActionState = { error: null };
