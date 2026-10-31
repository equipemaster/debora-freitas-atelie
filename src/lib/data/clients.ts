"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProfile, type ActionState } from "./_shared";

export interface ClientRow {
  id: string;
  name: string;
  contact: { email?: string | null; phone?: string | null };
  notes: string | null;
  created_at: string;
}

export async function listClients(): Promise<ClientRow[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, contact, notes, created_at")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ClientRow[];
}

const NewClientSchema = z.object({
  name: z.string().trim().min(1, "Digite o nome da cliente."),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createClientAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = NewClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { supabase, profile } = await requireProfile();
  const { error } = await supabase.from("clients").insert({
    org_id: profile.org_id,
    name: parsed.data.name,
    contact: { email: parsed.data.email || null, phone: parsed.data.phone || null },
    notes: parsed.data.notes || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { error: null };
}

export async function deleteClientAction(clientId: string): Promise<void> {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}
