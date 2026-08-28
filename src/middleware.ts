import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos do Next e a landing pública.
     * `/review/[token]` e `/entrar`/`/auth` ficam de fora da proteção dentro
     * de updateSession (isPublicPath), não aqui — o matcher só evita custo
     * em arquivos estáticos.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
