import students from "@/data/students.json";
import teachers from "@/data/teachers.json";
import summary from "@/data/summary.json";
import type { Population } from "./types";

export const studentsData = students as unknown as Population;
export const teachersData = teachers as unknown as Population;
export const summaryData = summary as unknown as {
  docentes: { n: number; idx: number; completitud: number; top: any[]; bottom: any[]; dimensions: any[] };
  estudiantes: { n: number; idx: number; completitud: number; top: any[]; bottom: any[]; dimensions: any[] };
  institucion: string;
};

export function semaforoColor(mean5: number): "success" | "warning" | "danger" {
  if (mean5 >= 4) return "success";
  if (mean5 >= 3) return "warning";
  return "danger";
}

export function semaforoBg(mean5: number): string {
  const c = semaforoColor(mean5);
  if (c === "success") return "bg-[var(--success)]";
  if (c === "warning") return "bg-[var(--warning)]";
  return "bg-[var(--danger)]";
}

export function semaforoText(mean5: number): string {
  const c = semaforoColor(mean5);
  if (c === "success") return "text-[var(--success)]";
  if (c === "warning") return "text-[var(--warning)]";
  return "text-[var(--danger)]";
}
