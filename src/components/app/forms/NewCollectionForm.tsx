"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCollectionAction } from "@/lib/data/collections";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const fieldClass =
  "h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink";

export function NewCollectionForm() {
  const [state, formAction, pending] = useActionState(createCollectionAction, { error: null });
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
        <span className="eyebrow">{t.management.collections.name}</span>
        <input name="name" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.collections.season}</span>
        <input name="season" placeholder="Verão, Inverno…" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.collections.year}</span>
        <input name="year" type="number" min="2000" max="2100" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.collections.description}</span>
        <input name="description" className={fieldClass} />
      </label>

      <div className="flex items-end gap-4 sm:col-span-2 lg:col-span-4 lg:justify-end">
        {state.error ? <p className="mr-auto self-center text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? t.management.collections.creating : t.management.collections.create}
        </Button>
      </div>
    </form>
  );
}
