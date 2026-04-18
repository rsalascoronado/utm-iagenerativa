import { createFileRoute } from "@tanstack/react-router";
import { studentsData } from "@/lib/data";
import { PopulationDashboard } from "@/components/PopulationDashboard";

export const Route = createFileRoute("/estudiantes")({
  head: () => ({
    meta: [
      { title: "Estudiantes · Encuesta UTM" },
      { name: "description", content: "Resultados de la población estudiantil de la UTM." },
    ],
  }),
  component: () => (
    <PopulationDashboard
      pop={studentsData}
      title="Población estudiantil"
      subtitle={`${studentsData.n_total.toLocaleString("es-MX")} respuestas analizadas`}
      variablesPath="/estudiantes/variables"
    />
  ),
});
