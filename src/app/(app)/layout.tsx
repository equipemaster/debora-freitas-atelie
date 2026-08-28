import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SidebarNav } from "@/components/app/SidebarNav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-paper md:flex">
        <div className="border-b border-border p-5">
          <Link href="/painel" aria-label="Ir para o painel">
            <Wordmark />
          </Link>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
