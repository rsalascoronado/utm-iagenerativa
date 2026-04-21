import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Sparkles, AlertCircle, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { summaryData } from "@/lib/data";
import { generateInsights } from "@/server/insights.functions";
import { useServerFn } from "@tanstack/react-start";
import {
  loadInsights,
  saveInsights,
  formatSavedAt,
  type Insights,
} from "@/lib/insightsCache";

type PopKey = "estudiantes" | "docentes";

export const Route = createFileRoute("/hallazgos")({
  head: () => ({
    meta: [
      { title: "Hallazgos IA · Encuesta UTM" },
      { name: "description", content: "Hallazgos, fortalezas, áreas de oportunidad y recomendaciones generadas con IA." },
    ],
  }),
  component: Hallazgos,
});

function Hallazgos() {
  const [loadingPop, setLoadingPop] = useState<PopKey | null>(null);
  const [data, setData] = useState<{ estudiantes?: Insights; docentes?: Insights }>({});
  const [staleAt, setStaleAt] = useState<{ estudiantes?: number; docentes?: number }>({});
  const [error, setError] = useState<string | null>(null);
  const generate = useServerFn(generateInsights);

  // Hidratar desde localStorage al montar (segunda capa de respaldo).
  useEffect(() => {
    const next: { estudiantes?: Insights; docentes?: Insights } = {};
    const stale: { estudiantes?: number; docentes?: number } = {};
    (["estudiantes", "docentes"] as const).forEach((pop) => {
      const cached = loadInsights(pop);
      if (cached) {
        next[pop] = cached.data;
        stale[pop] = cached.savedAt;
      }
    });
    if (Object.keys(next).length) {
      setData(next);
      setStaleAt(stale);
    }
  }, []);

  async function run(pop: PopKey) {
    setLoadingPop(pop);
    setError(null);
    try {
      const result = (await generate({
        data: { population: pop, summary: summaryData[pop] as any },
      })) as Insights | { error: string; offline?: boolean };

      if ("error" in result) {
        const cached = loadInsights(pop);
        if (cached) {
          setData((prev) => ({ ...prev, [pop]: cached.data }));
          setStaleAt((prev) => ({ ...prev, [pop]: cached.savedAt }));
          toast.warning(
            `Sin conexión: mostrando análisis previo (${formatSavedAt(cached.savedAt)})`,
          );
          return;
        }
        throw new Error(result.error);
      }

      setData((prev) => ({ ...prev, [pop]: result }));
      setStaleAt((prev) => {
        const { [pop]: _omit, ...rest } = prev;
        return rest;
      });
      saveInsights(pop, result);
      toast.success(`Hallazgos generados para ${pop}`);
    } catch (e) {
      const cached = loadInsights(pop);
      if (cached) {
        setData((prev) => ({ ...prev, [pop]: cached.data }));
        setStaleAt((prev) => ({ ...prev, [pop]: cached.savedAt }));
        toast.warning(
          `Sin conexión: mostrando análisis previo (${formatSavedAt(cached.savedAt)})`,
        );
      } else {
        const msg = e instanceof Error ? e.message : "Error desconocido";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoadingPop(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Hallazgos generados con IA"
        subtitle="Resumen ejecutivo, fortalezas, áreas de oportunidad y recomendaciones por dimensión."
      />

      <Tabs defaultValue="estudiantes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
          <TabsTrigger value="docentes">Docentes</TabsTrigger>
        </TabsList>

        {(["estudiantes", "docentes"] as const).map((pop) => (
          <TabsContent key={pop} value={pop} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--warning)]" />
                      Análisis automático — {pop}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Basado en {summaryData[pop].n.toLocaleString("es-MX")} respuestas · Índice global{" "}
                      {summaryData[pop].idx?.toFixed(2)}/5
                    </p>
                  </div>
                  <Button onClick={() => run(pop)} disabled={loadingPop === pop}>
                    {loadingPop === pop ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Generando…
                      </>
                    ) : data[pop] ? (
                      <>
                        <RefreshCw className="mr-1 h-4 w-4" /> Regenerar
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1 h-4 w-4" /> Generar análisis
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {error && loadingPop === null && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-center gap-2 py-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> {error}
                </CardContent>
              </Card>
            )}

            {data[pop] && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Resumen ejecutivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data[pop]!.resumen.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-[var(--success)]">Fortalezas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data[pop]!.fortalezas.map((f, i) => (
                      <div key={i} className="rounded-md border border-[var(--success)]/20 bg-[var(--success)]/5 p-3">
                        <p className="text-sm font-medium">{f.titulo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{f.detalle}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-[var(--danger)]">Áreas de oportunidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data[pop]!.oportunidades.map((o, i) => (
                      <div key={i} className="rounded-md border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-3">
                        <p className="text-sm font-medium">{o.titulo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{o.detalle}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Recomendaciones por dimensión</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data[pop]!.recomendaciones.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                        <Badge variant="outline" className="shrink-0">
                          {r.dimension}
                        </Badge>
                        <p className="text-sm">{r.accion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {!data[pop] && loadingPop !== pop && !error && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Pulsa "Generar análisis" para obtener hallazgos basados en los resultados de {pop}.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
