export type DistItem = { code: string; label: string; count: number; pct: number };

export type Variable = {
  name: string;
  label: string;
  section: string;
  block: string;
  qnum: string;
  n: number;
  completeness: number;
  type?: "categorical" | "likert" | "numeric" | "text";
  distribution?: DistItem[];
  mean?: number;
  scale_max?: number;
  mean_pct?: number;
  min?: number;
  max?: number;
  samples?: string[];
  top_words?: { word: string; count: number }[];
};

export type LikertItem = {
  name: string;
  label: string;
  mean: number;
  scale_max: number;
  n: number;
  block: string;
  section: string;
  distribution: DistItem[];
};

export type Dimension = {
  name: string;
  mean_5: number;
  n_items: number;
  items: { name: string; label: string; mean: number; scale_max: number; mean_5: number }[];
};

export type CrossRow = {
  dimension: string;
  overall: number;
  by_group: { group_code: string; group_label: string; n: number; mean_5: number }[];
};

export type Cross = {
  group_var: string;
  group_label: string;
  options: Record<string, string>;
  rows: CrossRow[];
};

export type Population = {
  name: string;
  n_total: number;
  n_variables: number;
  global_index_5: number | null;
  avg_completeness: number;
  variables: Variable[];
  likert_items: LikertItem[];
  top_items: LikertItem[];
  bottom_items: LikertItem[];
  dimensions: Dimension[];
  demographics: string[];
  crosses: Cross[];
};
