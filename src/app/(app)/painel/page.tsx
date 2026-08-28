import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.dashboard.title };

export default function PainelPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.brand.tagline}
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={
          <Link href="/projetos">
            <Button>{t.dashboard.newProject}</Button>
          </Link>
        }
      />

      <section>
        <p className="eyebrow mb-4">{t.dashboard.recentProjects}</p>
        <EmptyState
          title={t.common.empty}
          body={t.dashboard.emptyProjects}
          action={
            <Link href="/projetos">
              <Button>{t.dashboard.newProject}</Button>
            </Link>
          }
        />
      </section>
    </>
  );
}
