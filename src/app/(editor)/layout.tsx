import { QueryProvider } from "@/components/providers/QueryProvider";

/**
 * Grupo de rotas do editor — tela cheia, sem a barra lateral de gestão.
 * O QueryProvider vive aqui por enquanto (ver nota em QueryProvider.tsx).
 */
export default function EditorLayout({ children }: LayoutProps<"/">) {
  return <QueryProvider>{children}</QueryProvider>;
}
