import { createFileRoute } from "@tanstack/react-router";
import { teachersData } from "@/lib/data";
import { PopulationDashboard } from "@/components/PopulationDashboard";

export const Route = createFileRoute("/docentes")({
  head: () => ({
    meta: [
      { title: "Docentes · Encuesta UTM" },
      { name: "description", content: "Resultados de la población docente de la UTM." },
    ],
  }),
  component: () => (
    <PopulationDashboard
      pop={teachersData}
      title="Población docente"
      subtitle={`${teachersData.n_total.toLocaleString("es-MX")} respuestas analizadas`}
      variablesPath="/docentes/variables"
    />
  ),
});
