import { apiClient } from "./client";

export interface Document {
  id: number;
  title: string;
  target_language: string;
  original_filename: string | null;
  page_count: number;
  created_at: string;
}

export interface Page {
  page_number: number;
  text_content: string;
  document_id: number;
}

export async function getDocuments(targetLanguage?: string): Promise<Document[]> {
  const res = await apiClient.get<Document[]>("/documents", {
    params: targetLanguage ? { target_language: targetLanguage } : {},
  });
  return res.data;
}

export async function uploadDocument(
  file: File,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  form.append("target_language", targetLanguage);
  if (sourceLanguage) form.append("source_language", sourceLanguage);
  const res = await apiClient.post<Document>("/documents/upload", form, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function getDocument(id: number): Promise<Document> {
  const res = await apiClient.get<Document>(`/documents/${id}`);
  return res.data;
}

export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

export async function seedLanguage(targetLanguage: string): Promise<void> {
  await apiClient.post(`/seed?target_language=${encodeURIComponent(targetLanguage)}`);
}

export async function getPage(documentId: number, pageNumber: number): Promise<Page> {
  const res = await apiClient.get<Page>(`/documents/${documentId}/pages/${pageNumber}`);
  return res.data;
}

export async function createTextDocument(
  title: string,
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<Document> {
  const res = await apiClient.post<Document>("/documents/text", {
    title,
    content,
    target_language: targetLanguage,
    source_language: sourceLanguage ?? "",
  });
  return res.data;
}
