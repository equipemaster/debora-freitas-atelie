import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { NewCollectionForm } from "@/components/app/forms/NewCollectionForm";
import { listCollections } from "@/lib/data/collections";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.collections };

export default async function ColecoesPage() {
  const collections = await listCollections();

  return (
    <>
      <PageHeader
        eyebrow={t.nav.collections}
        title="Coleções"
        subtitle="Agrupe os projetos por coleção (estação e ano). Útil para lookbooks e para reencontrar vídeos antigos."
      />

      <div className="mb-8">
        <p className="eyebrow mb-3">{t.management.collections.title}</p>
        <NewCollectionForm />
      </div>

      {collections.length === 0 ? (
        <EmptyState title={t.common.empty} body={t.management.collections.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.id} className="border border-border p-5">
              <p className="display text-lg">{collection.name}</p>
              <p className="mt-1 text-sm text-muted">
                {[collection.season, collection.year].filter(Boolean).join(" · ") || "—"}
              </p>
              {collection.description ? (
                <p className="mt-3 text-sm text-muted">{collection.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
