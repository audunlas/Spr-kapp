import { apiClient } from "./client";

export interface Exercise {
  id: number;
  class_id: number;
  title: string;
  prompt: string;
  text_content: string;
  correct_indices: number[];
  created_at: string;
}

export interface ExercisePlay {
  id: number;
  class_id: number;
  title: string;
  prompt: string;
  text_content: string;
}

export interface CheckResult {
  score: number;
  total: number;
  correct_selected: number[];
  wrong_selected: number[];
  missed: number[];
}

export async function createExercise(data: {
  class_id: number;
  title: string;
  prompt: string;
  text_content: string;
  correct_indices: number[];
}): Promise<Exercise> {
  const res = await apiClient.post<Exercise>("/exercises", data);
  return res.data;
}

export async function getExercise(id: number): Promise<Exercise> {
  const res = await apiClient.get<Exercise>(`/exercises/${id}`);
  return res.data;
}

export async function updateExercise(id: number, data: {
  title?: string;
  prompt?: string;
  text_content?: string;
  correct_indices?: number[];
}): Promise<Exercise> {
  const res = await apiClient.patch<Exercise>(`/exercises/${id}`, data);
  return res.data;
}

export async function deleteExercise(id: number): Promise<void> {
  await apiClient.delete(`/exercises/${id}`);
}

export async function getExercisePlay(id: number): Promise<ExercisePlay> {
  const res = await apiClient.get<ExercisePlay>(`/exercises/${id}/play`);
  return res.data;
}

export async function checkExercise(id: number, selectedIndices: number[]): Promise<CheckResult> {
  const res = await apiClient.post<CheckResult>(`/exercises/${id}/check`, { selected_indices: selectedIndices });
  return res.data;
}
