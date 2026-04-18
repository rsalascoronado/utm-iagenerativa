import { createServerFn } from "@tanstack/react-start";

type SummaryShape = {
  n: number;
  idx: number;
  completitud: number;
  top: { label: string; mean: number; scale_max: number }[];
  bottom: { label: string; mean: number; scale_max: number }[];
  dimensions: { name: string; mean_5: number; n_items: number }[];
};

export const generateInsights = createServerFn({ method: "POST" })
  .inputValidator((input: { population: "estudiantes" | "docentes"; summary: SummaryShape }) => {
    if (input.population !== "estudiantes" && input.population !== "docentes") {
      throw new Error("population debe ser 'estudiantes' o 'docentes'");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "LOVABLE_API_KEY no configurada en el servidor." };
    }

    const { population, summary } = data;
    const top5 = summary.top
      .slice(0, 5)
      .map((t) => `- "${t.label.slice(0, 200)}" (μ=${((t.mean / t.scale_max) * 5).toFixed(2)}/5)`)
      .join("\n");
    const bot5 = summary.bottom
      .slice(0, 5)
      .map((t) => `- "${t.label.slice(0, 200)}" (μ=${((t.mean / t.scale_max) * 5).toFixed(2)}/5)`)
      .join("\n");
    const dims = summary.dimensions
      .map((d) => `- ${d.name}: ${d.mean_5.toFixed(2)}/5 (${d.n_items} ítems)`)
      .join("\n");

    const userPrompt = `Eres analista institucional. Analiza los resultados de la encuesta de la Universidad Tecnológica de la Mixteca para la población de **${population}**.

Datos clave:
- N = ${summary.n}
- Índice global: ${summary.idx?.toFixed(2)}/5
- Completitud promedio: ${summary.completitud}%

Dimensiones (promedio 0–5):
${dims || "(sin dimensiones)"}

Top 5 ítems mejor evaluados:
${top5 || "(sin datos)"}

Top 5 ítems peor evaluados:
${bot5 || "(sin datos)"}

Genera un análisis ejecutivo en español, conciso, basado SOLO en los datos anteriores. No inventes cifras.`;

    const tool = {
      type: "function",
      function: {
        name: "entregar_hallazgos",
        description: "Devuelve hallazgos estructurados",
        parameters: {
          type: "object",
          properties: {
            resumen: {
              type: "array",
              items: { type: "string" },
              description: "3 a 5 bullets de resumen ejecutivo",
            },
            fortalezas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  detalle: { type: "string" },
                },
                required: ["titulo", "detalle"],
              },
            },
            oportunidades: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  detalle: { type: "string" },
                },
                required: ["titulo", "detalle"],
              },
            },
            recomendaciones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dimension: { type: "string" },
                  accion: { type: "string" },
                },
                required: ["dimension", "accion"],
              },
            },
          },
          required: ["resumen", "fortalezas", "oportunidades", "recomendaciones"],
        },
      },
    } as const;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "Eres analista educativo. Responde SIEMPRE llamando a la función 'entregar_hallazgos' con datos precisos en español, basados estrictamente en la información provista.",
            },
            { role: "user", content: userPrompt },
          ],
          tools: [tool],
          tool_choice: { type: "function", function: { name: "entregar_hallazgos" } },
        }),
      });

      if (resp.status === 429) return { error: "Límite de uso alcanzado, intenta de nuevo en unos minutos." };
      if (resp.status === 402) return { error: "Sin créditos. Agrega créditos en Settings → Workspace → Usage." };
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return { error: `Error del servicio de IA (${resp.status}).` };
      }

      const json = await resp.json();
      const call = json?.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) {
        return { error: "Respuesta inesperada del modelo." };
      }
      const parsed = JSON.parse(call.function.arguments);
      return parsed;
    } catch (e) {
      console.error("generateInsights error:", e);
      return { error: e instanceof Error ? e.message : "Error desconocido" };
    }
  });
