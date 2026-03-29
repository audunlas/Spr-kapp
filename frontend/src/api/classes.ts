import { apiClient } from "./client";
import type { Document } from "./documents";
import type { VocabList } from "./vocab";

export interface ClassRoom {
  id: number;
  name: string;
  description: string | null;
  share_code: string;
  owner_id: number;
  created_at: string;
  documents: Document[];
  vocab_lists: VocabList[];
}

export async function getMyClasses(): Promise<ClassRoom[]> {
  const res = await apiClient.get<ClassRoom[]>("/classes");
  return res.data;
}

export async function getClassByShareCode(shareCode: string): Promise<ClassRoom> {
  const res = await apiClient.get<ClassRoom>(`/classes/join/${shareCode}`);
  return res.data;
}

export async function getClass(id: number): Promise<ClassRoom> {
  const res = await apiClient.get<ClassRoom>(`/classes/${id}`);
  return res.data;
}

export async function createClass(name: string, description?: string): Promise<ClassRoom> {
  const res = await apiClient.post<ClassRoom>("/classes", { name, description });
  return res.data;
}

export async function updateClass(id: number, name: string, description?: string): Promise<ClassRoom> {
  const res = await apiClient.patch<ClassRoom>(`/classes/${id}`, { name, description });
  return res.data;
}

export async function deleteClass(id: number): Promise<void> {
  await apiClient.delete(`/classes/${id}`);
}

export async function addDocumentToClass(classId: number, documentId: number): Promise<ClassRoom> {
  const res = await apiClient.post<ClassRoom>(`/classes/${classId}/documents`, { document_id: documentId });
  return res.data;
}

export async function removeDocumentFromClass(classId: number, docId: number): Promise<ClassRoom> {
  const res = await apiClient.delete<ClassRoom>(`/classes/${classId}/documents/${docId}`);
  return res.data;
}

export async function addVocabListToClass(classId: number, vocabListId: number): Promise<ClassRoom> {
  const res = await apiClient.post<ClassRoom>(`/classes/${classId}/vocab-lists`, { vocab_list_id: vocabListId });
  return res.data;
}

export async function removeVocabListFromClass(classId: number, listId: number): Promise<ClassRoom> {
  const res = await apiClient.delete<ClassRoom>(`/classes/${classId}/vocab-lists/${listId}`);
  return res.data;
}
