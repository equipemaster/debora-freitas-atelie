import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link mágico enviado por e-mail. Troca o `code` da URL por uma
 * sessão (cookies via @supabase/ssr) e manda a pessoa de volta pra onde
 * estava indo (`next`) ou para o painel.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/painel";
  const safeNext = next.startsWith("/") ? next : "/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    // Log só no servidor — a causa mais comum é PKCE: o link só troca por
    // sessão no MESMO navegador que pediu o acesso (o code_verifier fica
    // num cookie local). Abrir em outro navegador/dispositivo, ou clicar
    // duas vezes, ou o link ter expirado, todos caem aqui.
    console.error("[auth/callback] exchangeCodeForSession falhou:", error.message);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link_invalido`);
}
