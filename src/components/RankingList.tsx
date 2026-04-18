import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LikertItem } from "@/lib/types";
import { semaforoText } from "@/lib/data";

export function RankingList({
  title,
  items,
  variant,
}: {
  title: string;
  items: LikertItem[];
  variant: "top" | "bottom";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2.5">
          {items.map((it, i) => {
            const m5 = (it.mean / it.scale_max) * 5;
            return (
              <li key={it.name} className="flex items-start gap-3 text-sm">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    variant === "top" ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--danger)]/15 text-[var(--danger)]"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="flex-1 leading-snug text-foreground/90">{it.label}</p>
                <span className={`font-mono text-xs font-semibold tabular-nums ${semaforoText(m5)}`}>
                  {m5.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
