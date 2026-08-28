import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_APP_PATHS = ["/entrar", "/auth", "/review"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_APP_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Renova a sessão Supabase a cada requisição e protege as rotas de gestão.
 * `/review/[token]` e `/entrar` continuam públicas de propósito.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Sem Supabase configurado, não há como validar sessão — deixa passar
    // para não travar o app em ambientes de preview sem env vars.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() (não getSession()) valida o token contra o servidor Supabase —
  // é o que garante que a sessão não foi revogada/expirada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = new URL("/entrar", request.url);
    redirectUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/entrar") {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  return response;
}
