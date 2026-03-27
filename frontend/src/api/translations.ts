import { apiClient } from "./client";

export interface TranslationResponse {
  source_text: string;
  translated_text: string;
  alternatives: string[];
  cached: boolean;
}

export async function translate(
  text: string,
  sourceLang = "es",
  targetLang = "no"
): Promise<TranslationResponse> {
  const res = await apiClient.post<TranslationResponse>("/translate", {
    text,
    source_lang: sourceLang,
    target_lang: targetLang,
  });
  return res.data;
}
