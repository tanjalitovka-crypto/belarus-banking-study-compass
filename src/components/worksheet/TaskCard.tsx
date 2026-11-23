import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  number: number | string;
  title: string;
  instruction: string;
  points?: number;
  score?: number | null;
  onCheck?: () => void;
  children: ReactNode;
};

export function TaskCard({ number, title, instruction, points, score, onCheck, children }: Props) {
  return (
    <section className="print-avoid-break border-t border-border pt-8">
      <header className="mb-5 flex flex-wrap items-start gap-4">
        <span className="task-number flex size-10 shrink-0 items-center justify-center rounded-md text-lg font-semibold">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{instruction}</p>
        </div>
        {points !== undefined && (
          <div className="flex items-center gap-3">
            {score !== null && score !== undefined ? (
              <span
                className={
                  score === points
                    ? "rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success"
                    : "rounded-full bg-highlight px-3 py-1 text-sm font-semibold text-foreground"
                }
              >
                {score} / {points}
              </span>
            ) : (
              <span className="eyebrow">{points} б.</span>
            )}
            {onCheck && (
              <Button size="sm" variant="outline" className="no-print" onClick={onCheck}>
                <CheckCircle2 /> Проверить
              </Button>
            )}
          </div>
        )}
      </header>
      {children}
    </section>
  );
}
