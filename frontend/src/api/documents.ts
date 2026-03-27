import { apiClient } from "./client";

export interface Document {
  id: number;
  title: string;
  original_filename: string | null;
  page_count: number;
  created_at: string;
}

export interface Page {
  page_number: number;
  text_content: string;
  document_id: number;
}

export async function getDocuments(): Promise<Document[]> {
  const res = await apiClient.get<Document[]>("/documents");
  return res.data;
}

export async function uploadDocument(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  // Clear the default Content-Type so axios can set multipart/form-data
  // with the correct boundary automatically when given a FormData body.
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

export async function getPage(documentId: number, pageNumber: number): Promise<Page> {
  const res = await apiClient.get<Page>(`/documents/${documentId}/pages/${pageNumber}`);
  return res.data;
}
