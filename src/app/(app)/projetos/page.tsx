import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { NewProjectForm } from "@/components/app/forms/NewProjectForm";
import { listProjects } from "@/lib/data/projects";
import { listClients } from "@/lib/data/clients";
import { listCollections } from "@/lib/data/collections";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.projects };

export default async function ProjetosPage() {
  const [projects, clients, collections] = await Promise.all([
    listProjects(),
    listClients(),
    listCollections(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={t.nav.projects}
        title="Projetos de vídeo"
        subtitle="Cada projeto reúne a mídia, a linha do tempo e a exportação de um vídeo — organizado por cliente e coleção."
      />

      <div className="mb-8">
        <p className="eyebrow mb-3">{t.management.projects.title}</p>
        <NewProjectForm clients={clients} collections={collections} />
      </div>

      {projects.length === 0 ? (
        <EmptyState title={t.common.empty} body={t.management.projects.empty} />
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t.management.projects.projectTitle}</th>
                <th className="px-4 py-3 font-medium">{t.management.projects.kind}</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3 text-muted">{t.projectKind[project.kind]}</td>
                  <td className="px-4 py-3 text-muted">{t.projectStatus[project.status]}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/editor/${project.id}`}
                      className="text-sm underline underline-offset-2 hover:text-ink"
                    >
                      {t.management.projects.openEditor}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
