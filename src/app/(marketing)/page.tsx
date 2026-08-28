import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const useCases = [
  {
    k: t.projectKind.social,
    d: "Reels e Stories de coleções, provas e bastidores, com legendas, música e a assinatura da marca.",
  },
  {
    k: t.projectKind.client_presentation,
    d: "Vídeos de looks organizados por cliente, com link de revisão, comentários e aprovação.",
  },
  {
    k: t.projectKind.lookbook,
    d: "Fotos e clipes curtos em um catálogo em movimento, com ficha técnica de cada peça.",
  },
  {
    k: t.projectKind.making_of,
    d: "O processo completo: do croqui à peça final, em um vídeo de portfólio.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 md:px-10">
        <Wordmark />
        <Link href="/painel">
          <Button variant="outline" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-20 md:px-10">
        <p className="eyebrow mb-4">{t.brand.tagline}</p>
        <h1 className="display text-5xl md:text-7xl">
          Vídeos de alta costura,
          <br />
          com acabamento de ateliê.
        </h1>
        <p className="mt-6 max-w-prose text-sm text-muted md:text-base">
          Um editor de vídeo enxuto e guiado, feito para o ateliê Débora Freitas.
          Importe as gravações, monte pela linha do tempo e exporte dentro da
          identidade da marca — sem sair do preto e branco.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/painel">
            <Button size="lg">Abrir o painel</Button>
          </Link>
          <Link href="/projetos">
            <Button size="lg" variant="outline">
              Criar um vídeo
            </Button>
          </Link>
        </div>

        <ul className="mt-20 grid gap-px border border-border bg-border sm:grid-cols-2">
          {useCases.map((u) => (
            <li key={u.k} className="bg-background p-6">
              <p className="display text-lg">{u.k}</p>
              <p className="mt-2 text-sm text-muted">{u.d}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-border px-6 py-6 text-xs text-muted md:px-10">
        {t.brand.name} · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
