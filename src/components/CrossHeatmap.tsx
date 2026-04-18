import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { Cross } from "@/lib/types";
import { semaforoBg } from "@/lib/data";

export function CrossHeatmap({ crosses }: { crosses: Cross[] }) {
  const [idx, setIdx] = useState(0);
  if (!crosses.length) return null;
  const c = crosses[idx];
  // Collect unique groups across rows
  const groupKeys = Array.from(
    new Set(c.rows.flatMap((r) => r.by_group.map((g) => `${g.group_code}|${g.group_label}`)))
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Cruce: dimensión × {c.group_label.split(" ").slice(0, 5).join(" ")}</CardTitle>
            <CardDescription>Promedio normalizado a escala 0–5 por subgrupo.</CardDescription>
          </div>
          <Select value={String(idx)} onValueChange={(v) => setIdx(Number(v))}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {crosses.map((cc, i) => (
                <SelectItem key={cc.group_var} value={String(i)}>
                  {cc.group_var} — {cc.group_label.slice(0, 50)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-xs">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Dimensión</th>
              {groupKeys.map((k) => {
                const lbl = k.split("|")[1] || k;
                return (
                  <th key={k} className="px-1 py-2 text-center font-medium text-muted-foreground">
                    <span className="line-clamp-2">{lbl}</span>
                  </th>
                );
              })}
              <th className="px-2 py-2 text-center font-medium text-muted-foreground">Global</th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((r) => (
              <tr key={r.dimension} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{r.dimension}</td>
                {groupKeys.map((k) => {
                  const code = k.split("|")[0];
                  const cell = r.by_group.find((g) => g.group_code === code);
                  return (
                    <td key={k} className="p-1 text-center">
                      {cell ? (
                        <div
                          className={`mx-auto flex h-9 w-14 items-center justify-center rounded text-white font-mono text-xs ${semaforoBg(cell.mean_5)}`}
                          title={`n=${cell.n}`}
                        >
                          {cell.mean_5.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 text-center font-mono font-semibold">{r.overall.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
