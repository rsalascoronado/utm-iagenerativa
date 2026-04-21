/**
 * Persistencia local de hallazgos generados por IA.
 * Sirve como segunda capa de respaldo (sobrevive a limpieza del Cache API)
 * y permite mostrar la última respuesta válida cuando la red falla.
 */
export type Insights = {
  resumen: string[];
  fortalezas: { titulo: string; detalle: string }[];
  oportunidades: { titulo: string; detalle: string }[];
  recomendaciones: { dimension: string; accion: string }[];
};

export type CachedInsights = {
  data: Insights;
  savedAt: number; // epoch ms
};

const KEY_PREFIX = "utm-insights-cache:v1:";

function key(population: "estudiantes" | "docentes") {
  return `${KEY_PREFIX}${population}`;
}

export function loadInsights(
  population: "estudiantes" | "docentes",
): CachedInsights | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(population));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedInsights;
    if (!parsed?.data?.resumen) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveInsights(
  population: "estudiantes" | "docentes",
  data: Insights,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedInsights = { data, savedAt: Date.now() };
    window.localStorage.setItem(key(population), JSON.stringify(payload));
  } catch {
    // quota / privacy mode → ignorar silenciosamente
  }
}

export function formatSavedAt(ts: number): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}
