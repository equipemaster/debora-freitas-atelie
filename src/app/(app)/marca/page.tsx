import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.brandKit };

const palette = [
  { name: "Tinta", value: "#0A0A0A", varName: "--ink" },
  { name: "Papel", value: "#FAFAF8", varName: "--paper" },
  { name: "Preto puro", value: "#000000", varName: "--ink-pure" },
  { name: "Branco puro", value: "#FFFFFF", varName: "--white-pure" },
  { name: "Editor", value: "#0F0F0F", varName: "--surface-editor" },
  { name: "Filete", value: "#E4E2DD", varName: "--gray-200" },
];

export default function MarcaPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.nav.brandKit}
        title="Identidade da marca"
        subtitle="Paleta, tipografia e templates aplicados por padrão a todo projeto novo. Cores da marca: preto e branco."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paleta</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="grid grid-cols-2 gap-4">
              {palette.map((c) => (
                <li key={c.varName} className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 shrink-0 border border-border"
                    style={{ background: c.value }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-sm">{c.name}</span>
                    <span className="tabular block text-xs text-muted">
                      {c.value}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipografia</CardTitle>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <p className="eyebrow mb-1">Títulos — Cormorant Garamond</p>
              <p className="display text-3xl">Alta costura em movimento</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Interface — Inter</p>
              <p className="text-sm">
                Texto de interface, botões e formulários. Legível em telas
                pequenas, com números tabulares para timecodes.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-1">Dados técnicos — Geist Mono</p>
              <p className="tabular text-sm">00:12 · 1080p · 9:16 · 30fps</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <p className="mt-8 text-xs text-muted">
        Upload do logotipo (versões clara e escura), templates de abertura/
        encerramento e fontes personalizadas entram nesta tela na Fase&nbsp;0.
      </p>
    </>
  );
}
