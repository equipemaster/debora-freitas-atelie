// Cabeçalhos CORS compartilhados pelas Edge Functions públicas (chamadas direto
// do navegador em /review/[token], sem sessão). Libera qualquer origem por ora
// — trocar por NEXT_PUBLIC_APP_URL quando o domínio de produção estiver fixo
// (ver CLAUDE.md seção 11, pendência "Deploy Vercel").
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(
  body: unknown,
  init: { status?: number } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
