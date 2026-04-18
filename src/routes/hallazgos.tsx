import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { summaryData } from "@/lib/data";

type Insights = {
  resumen: string[];
  fortalezas: { titulo: string; detalle: string }[];
  oportunidades: { titulo: string; detalle: string }[];
  recomendaciones: { dimension: string; accion: string }[];
};

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
  const [loadingPop, setLoadingPop] = useState<"estudiantes" | "docentes" | null>(null);
  const [data, setData] = useState<{ estudiantes?: Insights; docentes?: Insights }>({});
  const [error, setError] = useState<string | null>(null);

  async function generate(pop: "estudiantes" | "docentes") {
    setLoadingPop(pop);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hallazgos`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ population: pop, summary: summaryData[pop] }),
      });
      if (resp.status === 429) throw new Error("Límite de uso alcanzado, intenta de nuevo en unos minutos.");
      if (resp.status === 402) throw new Error("Sin créditos disponibles. Agrega créditos en Settings → Workspace → Usage.");
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const json = (await resp.json()) as Insights;
      setData((prev) => ({ ...prev, [pop]: json }));
      toast.success(`Hallazgos generados para ${pop}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      toast.error(msg);
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
                  <Button onClick={() => generate(pop)} disabled={loadingPop === pop}>
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
