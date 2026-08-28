"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Clapperboard,
  Users,
  Layers,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const items = [
  { href: "/painel", label: t.nav.dashboard, icon: LayoutGrid },
  { href: "/projetos", label: t.nav.projects, icon: Clapperboard },
  { href: "/clientes", label: t.nav.clients, icon: Users },
  { href: "/colecoes", label: t.nav.collections, icon: Layers },
  { href: "/modelos", label: t.nav.templates, icon: LayoutTemplate },
  { href: "/marca", label: t.nav.brandKit, icon: Sparkles },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navegação principal">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ink text-white-pure"
                : "text-foreground hover:bg-block",
            )}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
