export type QuestionCategory =
  | "general"
  | "product"
  | "transaction"
  | "sales"
  | "report";

export type QuestionIntent =
  | "definition"
  | "advice"
  | "business_data"
  | "report"
  | "unknown";

export type QuestionAnalysis = {
  category: QuestionCategory;

  intent: QuestionIntent;

  /**
   * Nilai 0 sampai 1.
   *
   * Pada analyzer rule-based, confidence
   * ditentukan berdasarkan jumlah sinyal
   * yang ditemukan.
   */
  confidence: number;

  matchedKeywords: string[];

  matchedIntentKeywords: string[];

  /**
   * Bernilai true apabila pertanyaan
   * harus mengambil data bisnis.
   */
  requiresBusinessData: boolean;
};