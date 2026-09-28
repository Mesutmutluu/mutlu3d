const TRIPO_BASE_URL = "https://api.tripo3d.ai/v2/openapi";

function apiKey(): string {
  const key = process.env.TRIPO_API_KEY;
  if (!key) throw new Error("TRIPO_API_KEY is not set");
  return key;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
}

export type TripoTaskStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "banned"
  | "expired"
  | "cancelled";

export interface TripoTaskOutput {
  model?: string;
  pbr_model?: string;
  rendered_image?: string;
}

export interface TripoTaskData {
  task_id: string;
  status: TripoTaskStatus;
  progress?: number;
  output?: TripoTaskOutput;
}

interface TripoEnvelope<T> {
  code: number;
  message?: string;
  data: T;
}

async function tripoFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${TRIPO_BASE_URL}${path}`, init);
  const body = (await res.json()) as TripoEnvelope<T>;
  if (!res.ok || body.code !== 0) {
    throw new Error(body.message ?? `Tripo3D request failed (${res.status})`);
  }
  return body.data;
}

export async function createTextToModelTask(params: {
  prompt: string;
  negativePrompt?: string;
}): Promise<string> {
  const data = await tripoFetch<{ task_id: string }>("/task", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      type: "text_to_model",
      prompt: params.prompt,
      ...(params.negativePrompt
        ? { negative_prompt: params.negativePrompt }
        : {}),
    }),
  });
  return data.task_id;
}

export async function uploadImage(file: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", file, filename);
  const res = await fetch(`${TRIPO_BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  const body = (await res.json()) as TripoEnvelope<{ image_token: string }>;
  if (!res.ok || body.code !== 0) {
    throw new Error(body.message ?? `Tripo3D upload failed (${res.status})`);
  }
  return body.data.image_token;
}

export async function createImageToModelTask(params: {
  imageToken: string;
}): Promise<string> {
  const data = await tripoFetch<{ task_id: string }>("/task", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      type: "image_to_model",
      file: { file_token: params.imageToken },
    }),
  });
  return data.task_id;
}

export async function getTaskStatus(taskId: string): Promise<TripoTaskData> {
  return tripoFetch<TripoTaskData>(`/task/${taskId}`, {
    method: "GET",
    headers: authHeaders(),
  });
}
