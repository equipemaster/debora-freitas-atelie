"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EntrarForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/painel";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError(t.auth.invalidEmail);
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-6 py-16">
      <div className="mb-10">
        <Wordmark />
      </div>

      {status === "sent" ? (
        <div className="border border-dashed border-border p-8 text-center">
          <p className="display text-xl">{t.auth.checkEmailTitle}</p>
          <p className="mt-2 text-sm text-muted">{t.auth.checkEmailBody}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h1 className="display text-3xl">{t.auth.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.auth.subtitle}</p>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">{t.auth.emailLabel}</span>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              className="h-11 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" size="lg" disabled={status === "sending"}>
            {status === "sending" ? t.auth.sending : t.auth.sendLink}
          </Button>
        </form>
      )}
    </div>
  );
}
