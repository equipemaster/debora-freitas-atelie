"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Provider do TanStack Query.
 *
 * Por enquanto é montado apenas na rota do editor. Quando o fluxo de auth
 * estabilizar o layout raiz, avaliar subir este provider para lá e migrar
 * a página /review/[token] (hoje em useEffect+fetch) para useQuery.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
