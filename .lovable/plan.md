
## Dashboard interactivo: Análisis de la Encuesta UTM

Una app web con dos secciones independientes (Estudiantes y Docentes), cada una con KPIs, frecuencias, cruces clave, índices resumen y hallazgos generados con IA.

### Arquitectura de datos
- Procesar los 3 .xlsx en build-time con un script Node/Python que genere JSON limpios:
  - `students.json`, `teachers.json` — registros normalizados.
  - `students.dict.json`, `teachers.dict.json` — etiquetas, tipo (categórica/numérica/Likert), opciones de respuesta.
  - `summary.json` — frecuencias, promedios, cruces precalculados, índices.
- Cargar los JSON desde `src/data/` para evitar dependencias de servidor en el cliente.

### Rutas (TanStack Start)
- `/` — Portada con identidad UTM, totales generales (n estudiantes, n docentes, fecha, instrumentos), accesos a las dos secciones y resumen ejecutivo de hallazgos.
- `/estudiantes` — Dashboard de la población estudiantil.
- `/estudiantes/variables` — Explorador de todas las variables (frecuencias + gráfica por variable, con filtro de búsqueda).
- `/docentes` — Dashboard de la población docente.
- `/docentes/variables` — Explorador equivalente.
- `/hallazgos` — Narrativa con fortalezas, áreas de oportunidad y recomendaciones (generadas con Lovable AI a partir del `summary.json`).
- `/metodologia` — Ficha técnica: tamaño muestral, descripción de instrumentos, escala Likert utilizada, glosario.

### Contenido de cada dashboard (Estudiantes / Docentes)
1. **Tarjetas KPI**: total de respuestas, % de completitud, promedio global de satisfacción (índice Likert 1–5), top fortaleza, top área de oportunidad.
2. **Perfil demográfico**: gráficas de barras / dona para sexo, edad, carrera/área (estudiantes) o antigüedad/categoría (docentes), semestre, tiempo de servicio, etc.
3. **Resultados por dimensión**: agrupación temática derivada del diccionario (p. ej. infraestructura, docencia, servicios, vida universitaria) con barras horizontales de promedio por ítem y semáforo (verde ≥4, ámbar 3–3.9, rojo <3).
4. **Distribución Likert apilada**: 100% stacked bar por ítem mostrando % Muy en desacuerdo → Muy de acuerdo.
5. **Cruces clave** (filtros interactivos): satisfacción promedio por carrera, por sexo, por semestre/antigüedad. Heatmap de dimensión × grupo.
6. **Ranking**: 10 ítems mejor evaluados y 10 peor evaluados.
7. **Preguntas abiertas** (si existen): nube de palabras + lista de comentarios paginada.

### Filtros globales por sección
Selector de carrera/área, sexo, semestre/antigüedad — recalculan KPIs y gráficas en cliente vía URL search params (compartibles).

### Hallazgos e insights (IA)
- Edge function que toma el `summary.json` y, vía Lovable AI Gateway, genera:
  - Resumen ejecutivo (3–5 bullets).
  - Fortalezas detectadas (top dimensiones e ítems).
  - Áreas de oportunidad (ítems críticos + posibles causas a partir de cruces).
  - Recomendaciones accionables por dimensión.
- Resultado cacheado en JSON para no regenerar en cada visita; botón "Regenerar análisis".

### UX / diseño
- Layout con sidebar colapsable (Inicio, Estudiantes, Docentes, Hallazgos, Metodología) + header con título UTM.
- Paleta institucional sobria (azul/gris) con acentos de semáforo para evaluaciones.
- Tipografía legible, tarjetas con bordes suaves, modo claro por defecto.
- Componentes: shadcn (Card, Tabs, Table, Select, Badge) + Recharts para todas las gráficas.
- Responsive: en móvil las gráficas se apilan, sidebar se vuelve drawer.
- Cada gráfica tiene botón "Descargar PNG" y cada tabla "Exportar CSV".

### Entregables
Dashboard navegable con datos reales ya procesados, filtros funcionales, narrativa de hallazgos por IA y posibilidad de exportar tablas/gráficas.
