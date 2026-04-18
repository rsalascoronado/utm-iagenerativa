import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { studentsData, teachersData } from "@/lib/data";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodología · Encuesta UTM" },
      { name: "description", content: "Ficha técnica del análisis: muestra, instrumentos, escala y glosario." },
    ],
  }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Metodología" subtitle="Ficha técnica del análisis y glosario." />

      <Card>
        <CardHeader>
          <CardTitle>Ficha técnica</CardTitle>
          <CardDescription>Universidad Tecnológica de la Mixteca · Encuesta institucional</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <Item k="Población encuestada" v="Estudiantes y docentes de la UTM" />
            <Item k="Muestra estudiantes" v={`${studentsData.n_total.toLocaleString("es-MX")} respuestas`} />
            <Item k="Muestra docentes" v={`${teachersData.n_total.toLocaleString("es-MX")} respuestas`} />
            <Item k="Variables analizadas" v={`${studentsData.n_variables + teachersData.n_variables} (ambos instrumentos)`} />
            <Item k="Instrumentos" v="Cuestionarios en línea (plataforma Qualtrics) con preguntas cerradas, escalas Likert y abiertas." />
            <Item k="Escala Likert" v="4–5 niveles según ítem; los promedios se normalizan a una escala 0–5 para comparabilidad." />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convención de semáforo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row color="bg-[var(--success)]" lbl="Verde · ≥ 4.0 / 5" desc="Indicador favorable o de alto desempeño." />
          <Row color="bg-[var(--warning)]" lbl="Ámbar · 3.0 – 3.99 / 5" desc="Desempeño aceptable con margen de mejora." />
          <Row color="bg-[var(--danger)]" lbl="Rojo · < 3.0 / 5" desc="Área crítica que requiere intervención prioritaria." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Glosario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Glossary
            t="Índice global"
            d="Promedio de los promedios normalizados (0–5) de todos los ítems Likert del instrumento."
          />
          <Glossary
            t="Dimensión"
            d="Agrupación temática de ítems Likert según el bloque del cuestionario definido en el diccionario de variables."
          />
          <Glossary
            t="Cruce"
            d="Comparación del promedio de cada dimensión entre subgrupos (sexo, carrera, semestre, antigüedad, etc.)."
          />
          <Glossary
            t="Completitud"
            d="Porcentaje de respuestas válidas (no nulas) por variable respecto al total de la muestra."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procesamiento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Los datos se procesaron con Python (pandas / openpyxl) cruzándolos con los diccionarios de
          variables y los catálogos de codificación. Las distribuciones, promedios, dimensiones y
          cruces se precalcularon y se entregan como JSON al frontend para garantizar tiempos de
          respuesta instantáneos. Los hallazgos textuales se generan bajo demanda con un modelo de
          lenguaje vía Lovable AI.
        </CardContent>
      </Card>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}

function Row({ color, lbl, desc }: { color: string; lbl: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${color}`} />
      <div>
        <p className="font-medium">{lbl}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Glossary({ t, d }: { t: string; d: string }) {
  return (
    <div>
      <p className="font-medium">{t}</p>
      <p className="text-muted-foreground">{d}</p>
    </div>
  );
}
