import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Lightbulb, FileText, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { studentsData, teachersData, summaryData, semaforoText } from "@/lib/data";
import { KpiCard } from "@/components/KpiCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio · Encuesta UTM" },
      { name: "description", content: "Resumen general del análisis de la encuesta UTM 2024." },
    ],
  }),
  component: Home,
});

function Home() {
  const totalN = studentsData.n_total + teachersData.n_total;
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-xl border bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground md:p-10">
        <Badge variant="secondary" className="mb-3 bg-white/15 text-white hover:bg-white/20">
          Análisis estadístico · 2024
        </Badge>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {summaryData.institucion}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
          Dashboard interactivo con resultados de la encuesta aplicada a estudiantes y docentes.
          Explora indicadores, dimensiones, cruces clave y hallazgos generados con IA.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link to="/estudiantes">
              Ver estudiantes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link to="/docentes">Ver docentes</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total respuestas" value={totalN.toLocaleString("es-MX")} icon={Activity} />
        <KpiCard
          label="Estudiantes"
          value={studentsData.n_total.toLocaleString("es-MX")}
          hint={`Índice global ${studentsData.global_index_5?.toFixed(2)} / 5`}
          icon={GraduationCap}
          tone="primary"
        />
        <KpiCard
          label="Docentes"
          value={teachersData.n_total.toLocaleString("es-MX")}
          hint={`Índice global ${teachersData.global_index_5?.toFixed(2)} / 5`}
          icon={Users}
          tone="primary"
        />
        <KpiCard
          label="Variables analizadas"
          value={(studentsData.n_variables + teachersData.n_variables).toLocaleString("es-MX")}
          hint="Entre ambos instrumentos"
          icon={TrendingUp}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Estudiantes"
          icon={<GraduationCap className="h-5 w-5" />}
          n={studentsData.n_total}
          idx={studentsData.global_index_5 ?? 0}
          to="/estudiantes"
          top={studentsData.top_items[0]?.label}
          bottom={studentsData.bottom_items[0]?.label}
        />
        <SectionCard
          title="Docentes"
          icon={<Users className="h-5 w-5" />}
          n={teachersData.n_total}
          idx={teachersData.global_index_5 ?? 0}
          to="/docentes"
          top={teachersData.top_items[0]?.label}
          bottom={teachersData.bottom_items[0]?.label}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-[var(--warning)]" /> Hallazgos generados con IA
            </CardTitle>
            <CardDescription>
              Resumen ejecutivo, fortalezas, áreas de oportunidad y recomendaciones por dimensión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/hallazgos">
                Generar análisis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" /> Metodología
            </CardTitle>
            <CardDescription>
              Tamaño muestral, escala Likert, descripción de instrumentos y glosario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/metodologia">
                Ver ficha técnica <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  n,
  idx,
  to,
  top,
  bottom,
}: {
  title: string;
  icon: React.ReactNode;
  n: number;
  idx: number;
  to: "/estudiantes" | "/docentes";
  top?: string;
  bottom?: string;
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        <CardDescription>
          {n.toLocaleString("es-MX")} respuestas · Índice global{" "}
          <span className={`font-semibold ${semaforoText(idx)}`}>{idx.toFixed(2)} / 5</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {top && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--success)]">Fortaleza</p>
            <p className="mt-0.5 text-sm line-clamp-2">{top}</p>
          </div>
        )}
        {bottom && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--danger)]">Oportunidad</p>
            <p className="mt-0.5 text-sm line-clamp-2">{bottom}</p>
          </div>
        )}
        <Button asChild variant="ghost" className="px-0 text-primary hover:bg-transparent hover:text-primary">
          <Link to={to}>
            Abrir dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
