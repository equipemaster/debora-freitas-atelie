import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.projects };

export default function ProjetosPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.projects}
        title="Projetos de vídeo"
        subtitle="Cada projeto reúne a mídia, a linha do tempo e a exportação de um vídeo — organizado por cliente e coleção."
      />
      <EmptyState
        title="Assistente de criação em construção"
        body="Aqui você vai iniciar um projeto pelo Modo Assistido: escolher o tipo (redes sociais, apresentação, lookbook, making-of), o cliente e a coleção, e seguir etapa por etapa até exportar."
      />
    </>
  );
}
