import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.templates };

export default function ModelosPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.templates}
        title="Modelos"
        subtitle="Estruturas prontas de vídeo — abertura e encerramento da marca, cartelas de título e ficha técnica — para começar mais rápido."
      />
      <EmptyState
        title="Biblioteca em construção"
        body="Traremos modelos embutidos para cada caso de uso e permitiremos salvar os seus próprios."
      />
    </>
  );
}
