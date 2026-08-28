import { Suspense } from "react";
import type { Metadata } from "next";
import { EntrarForm } from "./EntrarForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  // useSearchParams() (usado no formulário, para preservar ?next=) exige um
  // limite de Suspense — sem isso o Next não consegue pré-renderizar a rota.
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}
