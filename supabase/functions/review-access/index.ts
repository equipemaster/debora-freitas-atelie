// Edge Function pública: acesso de revisão do cliente via link com token.
//
// A página /review/[token] (sem login) fala só com esta função — nunca direto
// com o Postgres via RLS anônima (não existe policy de anon nas tabelas de
// domínio, de propósito; ver CLAUDE.md seção 5). Esta função usa a service
// role, valida o token manualmente e decide o que expor.
//
// Body (POST, JSON): { token: string, action: "resolve" | "comment" | "approve", ...}
//
//   resolve  -> { project, videoUrl, comments[], allowComments }
//   comment  -> { body: string, authorName: string, timecodeMs?: number } => comment criado
//   approve  -> { decision: "approved" | "changes_requested", note?: string, decidedByName: string } => approval criado
//
// Deploy: supabase functions deploy review-access (via CLI, fora deste ambiente
// — ver pendência "Deploy Vercel/Supabase Functions" no CLAUDE.md).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const RENDER_URL_TTL_SECONDS = 60 * 60; // 1h — suficiente para uma sessão de revisão

function admin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes no ambiente da função.");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Carrega o link de revisão pelo token e garante que não expirou. */
async function loadReviewLink(db: ReturnType<typeof admin>, token: string) {
  if (!token || typeof token !== "string") {
    return { error: jsonResponse({ ok: false, error: "Token ausente." }, { status: 400 }) };
  }

  const { data: link, error } = await db
    .from("review_links")
    .select("id, project_id, expires_at, allow_comments")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return { error: jsonResponse({ ok: false, error: "Erro ao validar o link." }, { status: 500 }) };
  }
  if (!link) {
    return { error: jsonResponse({ ok: false, error: "Link de revisão não encontrado." }, { status: 404 }) };
  }
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return { error: jsonResponse({ ok: false, error: "Este link de revisão expirou." }, { status: 410 }) };
  }

  return { link };
}

async function handleResolve(db: ReturnType<typeof admin>, link: { id: string; project_id: string; allow_comments: boolean }) {
  const { data: project, error: projectError } = await db
    .from("projects")
    .select("id, title, kind, status, aspect_ratio, resolution, duration_ms")
    .eq("id", link.project_id)
    .maybeSingle();

  if (projectError || !project) {
    return jsonResponse({ ok: false, error: "Projeto não encontrado." }, { status: 404 });
  }

  // Render mais recente já concluído. Nas fases 0-1 pode não existir ainda —
  // a página de revisão mostra "vídeo ainda não exportado" nesse caso.
  const { data: render } = await db
    .from("renders")
    .select("output_path, finished_at")
    .eq("project_id", project.id)
    .eq("status", "done")
    .order("finished_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let videoUrl: string | null = null;
  if (render?.output_path) {
    const { data: signed } = await db.storage
      .from("renders")
      .createSignedUrl(render.output_path, RENDER_URL_TTL_SECONDS);
    videoUrl = signed?.signedUrl ?? null;
  }

  const { data: comments } = await db
    .from("comments")
    .select("id, author_name, body, timecode_ms, resolved, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  return jsonResponse({
    ok: true,
    data: {
      project,
      videoUrl,
      comments: comments ?? [],
      allowComments: link.allow_comments,
    },
  });
}

async function handleComment(
  db: ReturnType<typeof admin>,
  link: { id: string; project_id: string; allow_comments: boolean },
  payload: Record<string, unknown>,
) {
  if (!link.allow_comments) {
    return jsonResponse({ ok: false, error: "Comentários desativados neste link." }, { status: 403 });
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const authorName = typeof payload.authorName === "string" ? payload.authorName.trim() : "";
  const timecodeMs =
    typeof payload.timecodeMs === "number" && Number.isFinite(payload.timecodeMs)
      ? Math.max(0, Math.round(payload.timecodeMs))
      : null;

  if (!body) return jsonResponse({ ok: false, error: "Escreva um comentário." }, { status: 400 });
  if (body.length > 2000) return jsonResponse({ ok: false, error: "Comentário muito longo (máx. 2000 caracteres)." }, { status: 400 });
  if (!authorName) return jsonResponse({ ok: false, error: "Informe seu nome." }, { status: 400 });

  const { data: comment, error } = await db
    .from("comments")
    .insert({
      project_id: link.project_id,
      review_link_id: link.id,
      author_name: authorName,
      body,
      timecode_ms: timecodeMs,
    })
    .select("id, author_name, body, timecode_ms, resolved, created_at")
    .single();

  if (error || !comment) {
    return jsonResponse({ ok: false, error: "Não foi possível salvar o comentário." }, { status: 500 });
  }

  return jsonResponse({ ok: true, data: comment }, { status: 201 });
}

async function handleApprove(
  db: ReturnType<typeof admin>,
  link: { id: string; project_id: string },
  payload: Record<string, unknown>,
) {
  const decision = payload.decision === "approved" || payload.decision === "changes_requested" ? payload.decision : null;
  const decidedByName = typeof payload.decidedByName === "string" ? payload.decidedByName.trim() : "";
  const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 2000) : null;

  if (!decision) return jsonResponse({ ok: false, error: "Decisão inválida." }, { status: 400 });
  if (!decidedByName) return jsonResponse({ ok: false, error: "Informe seu nome." }, { status: 400 });

  const { data: approval, error } = await db
    .from("approvals")
    .insert({
      project_id: link.project_id,
      review_link_id: link.id,
      decision,
      note,
      decided_by_name: decidedByName,
    })
    .select("id, decision, note, decided_by_name, created_at")
    .single();

  if (error || !approval) {
    return jsonResponse({ ok: false, error: "Não foi possível registrar a decisão." }, { status: 500 });
  }

  const newStatus = decision === "approved" ? "approved" : "in_review";
  await db.from("projects").update({ status: newStatus }).eq("id", link.project_id);

  const { data: project } = await db.from("projects").select("org_id").eq("id", link.project_id).maybeSingle();
  if (project?.org_id) {
    await db.from("activity_log").insert({
      org_id: project.org_id,
      actor: null,
      entity: "project",
      entity_id: link.project_id,
      action: "review_decision",
      meta: { decision, decided_by_name: decidedByName, review_link_id: link.id },
    });
  }

  return jsonResponse({ ok: true, data: approval }, { status: 201 });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método não suportado." }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const token = payload.token;
  const action = payload.action;

  if (typeof token !== "string") {
    return jsonResponse({ ok: false, error: "Token ausente." }, { status: 400 });
  }
  if (action !== "resolve" && action !== "comment" && action !== "approve") {
    return jsonResponse({ ok: false, error: "Ação inválida." }, { status: 400 });
  }

  const db = admin();
  const { link, error } = await loadReviewLink(db, token);
  if (error) return error;

  switch (action) {
    case "resolve":
      return handleResolve(db, link);
    case "comment":
      return handleComment(db, link, payload);
    case "approve":
      return handleApprove(db, link, payload);
  }
});
