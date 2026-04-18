import { createFileRoute } from "@tanstack/react-router";
import { teachersData } from "@/lib/data";
import { VariablesExplorer } from "@/components/VariablesExplorer";

export const Route = createFileRoute("/docentes/variables")({
  head: () => ({ meta: [{ title: "Variables docentes · UTM" }] }),
  component: () => <VariablesExplorer pop={teachersData} title="Explorador de variables — Docentes" />,
});
