import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.collections };

export default function ColecoesPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.collections}
        title="Coleções"
        subtitle="Agrupe os projetos por coleção (estação e ano). Útil para lookbooks e para reencontrar vídeos antigos."
      />
      <EmptyState
        title="Cadastro em construção"
        body="Em breve você poderá criar coleções com estação, ano e capa, e reunir todos os vídeos de cada uma."
      />
    </>
  );
}
