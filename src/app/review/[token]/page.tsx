import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/Wordmark";
import { ReviewClient } from "./ReviewClient";

export const metadata: Metadata = { title: "Revisão do vídeo" };

/**
 * Página pública de revisão — sem login. Recebe o token pela URL e delega
 * toda a leitura/escrita para a Edge Function `review-access` (service role
 * do lado do servidor; RLS não expõe nada a usuários anônimos, de propósito
 * — ver CLAUDE.md seções 4 e 5).
 */
export default async function ReviewPage({
  params,
}: PageProps<"/review/[token]">) {
  const { token } = await params;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-10 md:py-14">
      <header className="mb-10">
        <Wordmark />
      </header>
      <ReviewClient token={token} />
    </div>
  );
}
