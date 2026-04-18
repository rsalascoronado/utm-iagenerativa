import { Link } from "@tanstack/react-router";
import { Activity, CheckCircle2, ListChecks, Star, AlertTriangle } from "lucide-react";
import type { Population } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { DimensionBars } from "@/components/DimensionBars";
import { RankingList } from "@/components/RankingList";
import { LikertStacked } from "@/components/LikertStacked";
import { CrossHeatmap } from "@/components/CrossHeatmap";
import { DistributionChart } from "@/components/DistributionChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function PopulationDashboard({
  pop,
  title,
  subtitle,
  variablesPath,
}: {
  pop: Population;
  title: string;
  subtitle: string;
  variablesPath: "/estudiantes/variables" | "/docentes/variables";
}) {
  const idx = pop.global_index_5 ?? 0;
  const demoVars = pop.variables.filter((v) => pop.demographics.includes(v.name)).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button asChild variant="outline">
            <Link to={variablesPath}>
              <ListChecks className="mr-1 h-4 w-4" /> Explorar variables
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Respuestas" value={pop.n_total.toLocaleString("es-MX")} icon={Activity} />
        <KpiCard
          label="Completitud"
          value={`${pop.avg_completeness}%`}
          icon={CheckCircle2}
          hint="Promedio entre variables"
        />
        <KpiCard
          label="Índice global"
          value={`${idx.toFixed(2)}/5`}
          icon={Star}
          tone={idx >= 4 ? "success" : idx >= 3 ? "warning" : "danger"}
        />
        <KpiCard
          label="Top fortaleza"
          value={pop.top_items[0] ? `${((pop.top_items[0].mean / pop.top_items[0].scale_max) * 5).toFixed(2)}` : "—"}
          hint={pop.top_items[0]?.label}
          icon={Star}
          tone="success"
        />
        <KpiCard
          label="Top oportunidad"
          value={pop.bottom_items[0] ? `${((pop.bottom_items[0].mean / pop.bottom_items[0].scale_max) * 5).toFixed(2)}` : "—"}
          hint={pop.bottom_items[0]?.label}
          icon={AlertTriangle}
          tone="danger"
        />
      </section>

      <Tabs defaultValue="dimensiones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dimensiones">Dimensiones</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="likert">Distribución Likert</TabsTrigger>
          <TabsTrigger value="cruces">Cruces clave</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="dimensiones" className="space-y-4">
          <DimensionBars dimensions={pop.dimensions} />
        </TabsContent>

        <TabsContent value="ranking" className="grid gap-4 md:grid-cols-2">
          <RankingList title="10 ítems mejor evaluados" items={pop.top_items} variant="top" />
          <RankingList title="10 ítems peor evaluados" items={pop.bottom_items} variant="bottom" />
        </TabsContent>

        <TabsContent value="likert" className="space-y-4">
          <LikertStacked title="Distribución porcentual de respuestas (top 15 ítems)" items={pop.likert_items.slice(0, 15)} />
        </TabsContent>

        <TabsContent value="cruces" className="space-y-4">
          {pop.crosses.length > 0 ? (
            <CrossHeatmap crosses={pop.crosses} />
          ) : (
            <p className="text-sm text-muted-foreground">No se identificaron variables demográficas para cruces.</p>
          )}
        </TabsContent>

        <TabsContent value="perfil" className="grid gap-4 md:grid-cols-2">
          {demoVars.length > 0 ? (
            demoVars.map((v) => (
              <DistributionChart key={v.name} title={v.label} data={v.distribution!} layout="horizontal" />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin variables demográficas detectadas.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
