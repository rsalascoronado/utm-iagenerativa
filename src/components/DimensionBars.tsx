import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Dimension } from "@/lib/types";
import { semaforoBg, semaforoText } from "@/lib/data";

export function DimensionBars({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados por dimensión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((d) => (
          <div key={d.name} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{d.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {d.n_items} ítems
                </Badge>
                <span className={`text-sm font-semibold tabular-nums ${semaforoText(d.mean_5)}`}>
                  {d.mean_5.toFixed(2)}/5
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${semaforoBg(d.mean_5)} transition-all`}
                style={{ width: `${(d.mean_5 / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
