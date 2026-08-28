import { cn } from "@/lib/utils";

/**
 * Marca-texto provisória enquanto não recebemos o SVG oficial do logo
 * (o arquivo enviado é PNG branco sobre transparente). Segue a estrutura
 * do logotipo: "DÉBORA · FREITAS" com "ATELIÊ" abaixo, em versalete.
 */
export function Wordmark({
  className,
  variant = "ink",
}: {
  className?: string;
  variant?: "ink" | "paper";
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col leading-none",
        variant === "paper" ? "text-white-pure" : "text-ink",
        className,
      )}
    >
      <span className="display text-lg tracking-[0.2em]">
        DÉBORA&nbsp;FREITAS
      </span>
      <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.55em] text-muted">
        Ateliê
      </span>
    </span>
  );
}
