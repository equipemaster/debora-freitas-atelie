import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { NewClientForm } from "@/components/app/forms/NewClientForm";
import { listClients } from "@/lib/data/clients";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.clients };

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <>
      <PageHeader
        eyebrow={t.nav.clients}
        title="Clientes"
        subtitle="Cadastro das clientes do ateliê. Cada projeto de apresentação e cada link de revisão fica vinculado a uma cliente."
      />

      <div className="mb-8">
        <p className="eyebrow mb-3">{t.management.clients.title}</p>
        <NewClientForm />
      </div>

      {clients.length === 0 ? (
        <EmptyState title={t.common.empty} body={t.management.clients.empty} />
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t.management.clients.name}</th>
                <th className="px-4 py-3 font-medium">{t.management.clients.email}</th>
                <th className="px-4 py-3 font-medium">{t.management.clients.phone}</th>
                <th className="px-4 py-3 font-medium">{t.management.clients.notes}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-muted">{client.contact?.email || "—"}</td>
                  <td className="px-4 py-3 text-muted">{client.contact?.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted">{client.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
