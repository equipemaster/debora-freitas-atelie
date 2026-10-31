"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClientAction } from "@/lib/data/clients";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const fieldClass =
  "h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink";

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClientAction, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 border border-dashed border-border p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-1">
        <span className="eyebrow">{t.management.clients.name}</span>
        <input name="name" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.clients.email}</span>
        <input name="email" type="email" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.clients.phone}</span>
        <input name="phone" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.clients.notes}</span>
        <input name="notes" className={fieldClass} />
      </label>

      <div className="flex items-end gap-4 sm:col-span-2 lg:col-span-4 lg:justify-end">
        {state.error ? <p className="mr-auto self-center text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? t.management.clients.creating : t.management.clients.create}
        </Button>
      </div>
    </form>
  );
}
