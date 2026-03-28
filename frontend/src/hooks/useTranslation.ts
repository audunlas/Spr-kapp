import { useCallback, useRef, useState } from "react";
import { translate } from "../api/translations";

const LRU_MAX = 500;

export interface TranslationResult {
  translation: string;
  alternatives: string[];
}

export function useTranslation() {
  const cache = useRef<Map<string, TranslationResult>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = useCallback(async (
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<TranslationResult | null> => {
    const key = `${sourceLang}:${targetLang}:${text.trim().toLowerCase()}`;
    if (!text.trim()) return null;

    const cached = cache.current.get(key);
    if (cached !== undefined) return cached;

    setIsLoading(true);
    setError(null);
    try {
      const result = await translate(text, sourceLang, targetLang);
      if (cache.current.size >= LRU_MAX) {
        const firstKey = cache.current.keys().next().value!;
        cache.current.delete(firstKey);
      }
      const entry: TranslationResult = {
        translation: result.translated_text,
        alternatives: result.alternatives,
      };
      cache.current.set(key, entry);
      return entry;
    } catch {
      setError("Translation failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translateText, isLoading, error };
}
