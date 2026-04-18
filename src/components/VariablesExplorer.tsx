import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import type { Population, Variable } from "@/lib/types";
import { DistributionChart } from "@/components/DistributionChart";
import { semaforoText } from "@/lib/data";
import { Search } from "lucide-react";

export function VariablesExplorer({ pop, title }: { pop: Population; title: string }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Variable | null>(null);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return pop.variables.filter(
      (v) =>
        !ql ||
        v.label.toLowerCase().includes(ql) ||
        v.name.toLowerCase().includes(ql) ||
        v.block.toLowerCase().includes(ql)
    );
  }, [q, pop.variables]);

  const current = sel || list[0];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader title={title} subtitle={`${pop.variables.length} variables · ${pop.n_total.toLocaleString("es-MX")} respuestas`} />
      <div className="grid gap-4 md:grid-cols-[340px_1fr]">
        <Card className="md:max-h-[78vh] md:overflow-hidden">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar variable…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8"
              />
            </div>
            <CardDescription className="mt-1">{list.length} resultados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 overflow-y-auto md:max-h-[64vh]">
            {list.map((v) => {
              const active = current?.name === v.name;
              return (
                <button
                  key={v.name}
                  onClick={() => setSel(v)}
                  className={`w-full rounded-md border px-2.5 py-2 text-left text-xs transition ${
                    active ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{v.name}</span>
                    <Badge variant="outline" className="text-[9px]">{v.type}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 leading-snug">{v.label}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {current ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{current.name}</p>
                      <CardTitle className="mt-1 text-base leading-snug">{current.label}</CardTitle>
                      <CardDescription className="mt-1">
                        {current.section}
                        {current.block && ` · ${current.block}`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">n = {current.n}</Badge>
                      <Badge variant="outline">{current.completeness}% respuesta</Badge>
                      {current.mean != null && current.scale_max && (
                        <Badge className={`${semaforoText((current.mean / current.scale_max) * 5)} bg-transparent border`}>
                          μ {current.mean}/{current.scale_max}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {current.distribution && (
                <DistributionChart
                  title="Distribución de respuestas"
                  data={current.distribution}
                  layout="horizontal"
                />
              )}

              {current.type === "text" && current.samples && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comentarios ({current.samples.length} mostrados)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {current.top_words && current.top_words.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {current.top_words.slice(0, 20).map((w) => (
                          <Badge key={w.word} variant="secondary" className="text-xs">
                            {w.word} · {w.count}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ul className="max-h-96 space-y-2 overflow-y-auto pr-2 text-sm">
                      {current.samples.map((s, i) => (
                        <li key={i} className="rounded border bg-muted/30 p-2 text-xs">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona una variable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
