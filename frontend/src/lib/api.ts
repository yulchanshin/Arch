import { API_BASE_URL } from './constants';
import type { AIResponse } from '@/types/actions';
import type { AppNode, AppEdge } from '@/types/graph';

type ModifyRequest = {
  graph: { nodes: AppNode[]; edges: AppEdge[] };
  prompt: string;
  history: { role: string; content: string }[];
};

type GenerateRequest = {
  prompt: string;
};

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail ?? `Request failed (${res.status})`);
  }

  return res.json();
}

export async function generateGraph(prompt: string): Promise<AIResponse> {
  const body: GenerateRequest = { prompt };
  const data = await request<{ ai_response: AIResponse }>('/api/generate', body);
  return data.ai_response;
}

export async function modifyGraph(
  graph: { nodes: AppNode[]; edges: AppEdge[] },
  prompt: string,
  history: { role: string; content: string }[]
): Promise<AIResponse> {
  const body: ModifyRequest = { graph, prompt, history };
  const data = await request<{ ai_response: AIResponse }>('/api/modify', body);
  return data.ai_response;
}
