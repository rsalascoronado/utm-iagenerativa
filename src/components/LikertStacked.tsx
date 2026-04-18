import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LikertItem } from "@/lib/types";

const COLORS = ["var(--danger)", "#f59e0b", "var(--muted-foreground)", "#84cc16", "var(--success)"];

export function LikertStacked({ title, items }: { title: string; items: LikertItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 15).map((it) => {
            const total = it.distribution.reduce((s, d) => s + d.count, 0);
            return (
              <div key={it.name} className="space-y-1">
                <p className="text-xs leading-snug text-foreground/85 line-clamp-2">{it.label}</p>
                <div className="flex h-5 w-full overflow-hidden rounded-md border border-border/60">
                  {it.distribution.map((d, i) => {
                    const pct = (d.count / total) * 100;
                    return (
                      <div
                        key={d.code}
                        className="flex items-center justify-center text-[10px] font-medium text-white"
                        style={{
                          width: `${pct}%`,
                          background: COLORS[Math.min(i, COLORS.length - 1)],
                        }}
                        title={`${d.label}: ${pct.toFixed(1)}%`}
                      >
                        {pct >= 8 ? `${pct.toFixed(0)}%` : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
