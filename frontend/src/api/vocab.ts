import { apiClient } from "./client";

export interface VocabEntry {
  id: number;
  list_id: number;
  native_word: string;
  target_word: string;
}

export interface VocabList {
  id: number;
  name: string;
  target_language: string;
  entries: VocabEntry[];
  created_at: string;
}

export async function getVocabLists(targetLanguage?: string): Promise<VocabList[]> {
  const res = await apiClient.get<VocabList[]>("/vocab/lists", {
    params: targetLanguage ? { target_language: targetLanguage } : {},
  });
  return res.data;
}

export async function getVocabList(id: number): Promise<VocabList> {
  const res = await apiClient.get<VocabList>(`/vocab/lists/${id}`);
  return res.data;
}

export async function createVocabList(name: string, targetLanguage: string): Promise<VocabList> {
  const res = await apiClient.post<VocabList>("/vocab/lists", { name, target_language: targetLanguage });
  return res.data;
}

export async function renameVocabList(id: number, name: string): Promise<VocabList> {
  const res = await apiClient.patch<VocabList>(`/vocab/lists/${id}`, { name });
  return res.data;
}

export async function deleteVocabList(id: number): Promise<void> {
  await apiClient.delete(`/vocab/lists/${id}`);
}

export async function addEntries(listId: number, raw: string): Promise<VocabList> {
  const res = await apiClient.post<VocabList>(`/vocab/lists/${listId}/entries`, { raw });
  return res.data;
}

export async function deleteEntry(listId: number, entryId: number): Promise<void> {
  await apiClient.delete(`/vocab/lists/${listId}/entries/${entryId}`);
}
