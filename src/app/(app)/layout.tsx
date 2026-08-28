import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SidebarNav } from "@/components/app/SidebarNav";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O middleware já garante que só chega aqui autenticado, mas o layout não
  // deve assumir isso silenciosamente — se por algum motivo não houver
  // usuário, melhor não vazar nada e deixar a rota tratar (ela vai redirecionar).
  const profile = user
    ? (
        await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      ).data
    : null;

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-paper md:flex">
        <div className="border-b border-border p-5">
          <Link href="/painel" aria-label="Ir para o painel">
            <Wordmark />
          </Link>
        </div>
        <SidebarNav />
        {user ? (
          <div className="mt-auto border-t border-border p-5 text-sm">
            <p className="truncate font-medium">{profile?.full_name || user.email}</p>
            <form action="/auth/sign-out" method="POST" className="mt-2">
              <button type="submit" className="text-xs text-muted hover:text-ink">
                {t.auth.signOut}
              </button>
            </form>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {user && !profile?.full_name ? (
          <div className="border-b border-border bg-block px-6 py-3 text-sm md:px-10">
            {t.onboarding.nudge} —{" "}
            <Link href="/onboarding" className="underline underline-offset-2">
              {t.onboarding.nudgeAction}
            </Link>
          </div>
        ) : null}
        <main className="flex-1 px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
