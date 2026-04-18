import { createFileRoute } from "@tanstack/react-router";
import { studentsData } from "@/lib/data";
import { VariablesExplorer } from "@/components/VariablesExplorer";

export const Route = createFileRoute("/estudiantes/variables")({
  head: () => ({ meta: [{ title: "Variables estudiantes · UTM" }] }),
  component: () => <VariablesExplorer pop={studentsData} title="Explorador de variables — Estudiantes" />,
});
