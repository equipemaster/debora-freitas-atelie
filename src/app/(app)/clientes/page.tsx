import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.clients };

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.clients}
        title="Clientes"
        subtitle="Cadastro das clientes do ateliê. Cada projeto de apresentação e cada link de revisão fica vinculado a uma cliente."
      />
      <EmptyState
        title="Cadastro em construção"
        body="Em breve você poderá registrar clientes, anexar contatos e ver todos os vídeos e aprovações de cada uma."
      />
    </>
  );
}
