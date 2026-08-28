import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

async function completeProfile(formData: FormData) {
  "use server";

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // RLS (profiles_self_update): só altera o próprio registro, e o gatilho de
  // guarda (0003) só bloqueia troca de role/org_id — full_name passa livre.
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);

  redirect("/painel");
}

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.full_name) {
    redirect("/painel");
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-6 py-16">
      <div className="mb-10">
        <Wordmark />
      </div>

      <h1 className="display text-3xl">{t.onboarding.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.onboarding.subtitle}</p>

      <form action={completeProfile} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm">
          <span className="eyebrow">{t.onboarding.nameLabel}</span>
          <input
            name="fullName"
            autoFocus
            required
            defaultValue={user.user_metadata?.full_name ?? ""}
            className="h-11 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink"
            placeholder={t.onboarding.namePlaceholder}
          />
        </label>

        <Button type="submit" size="lg">
          {t.onboarding.continue}
        </Button>
      </form>
    </div>
  );
}
