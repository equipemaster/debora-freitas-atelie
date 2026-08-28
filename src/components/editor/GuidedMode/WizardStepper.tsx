"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStepMeta {
  key: string;
  label: string;
}

export function WizardStepper({
  steps,
  current,
}: {
  steps: WizardStepMeta[];
  current: number;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center border text-[10px]",
                done && "border-white-pure bg-white-pure text-ink",
                active && "border-white-pure text-white-pure",
                !done && !active && "border-gray-700 text-gray-500",
              )}
            >
              {done ? <Check size={11} aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                active ? "text-white-pure" : "text-gray-500",
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 h-px w-4 bg-gray-700" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
