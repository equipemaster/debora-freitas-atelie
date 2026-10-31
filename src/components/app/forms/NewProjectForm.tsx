"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/lib/data/projects";
import type { ClientRow } from "@/lib/data/clients";
import type { CollectionRow } from "@/lib/data/collections";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const fieldClass =
  "h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ink";

export function NewProjectForm({
  clients,
  collections,
}: {
  clients: ClientRow[];
  collections: CollectionRow[];
}) {
  const [state, formAction, pending] = useActionState(createProjectAction, { error: null });

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 border border-dashed border-border p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="eyebrow">{t.management.projects.projectTitle}</span>
        <input name="title" required className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.projects.kind}</span>
        <select name="kind" required defaultValue="social" className={fieldClass}>
          {Object.entries(t.projectKind).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="eyebrow">{t.management.projects.client}</span>
        <select name="clientId" defaultValue="" className={fieldClass}>
          <option value="">{t.management.projects.none}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-1">
        <span className="eyebrow">{t.management.projects.collection}</span>
        <select name="collectionId" defaultValue="" className={fieldClass}>
          <option value="">{t.management.projects.none}</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
              {collection.year ? ` (${collection.year})` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-4 sm:col-span-2 lg:col-span-4 lg:justify-end">
        {state.error ? <p className="mr-auto self-center text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? t.management.projects.creating : t.management.projects.create}
        </Button>
      </div>
    </form>
  );
}
