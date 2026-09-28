const REPLICATE_BASE_URL = "https://api.replicate.com/v1";

// tencent/hunyuan-3d-3.1 is an "official model" on Replicate, so it can be
// called via the /models/{owner}/{name}/predictions shortcut without pinning
// a version id.
const TEXT_TO_MODEL_ROUTE = "tencent/hunyuan-3d-3.1";

function apiKey(): string {
  const key = process.env.REPLICATE_API_TOKEN;
  if (!key) throw new Error("REPLICATE_API_TOKEN is not set");
  return key;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
}

export type ReplicateStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export interface ReplicatePrediction {
  id: string;
  status: ReplicateStatus;
  output?: string | null;
  error?: string | null;
}

export async function createTextToModelTask(params: {
  prompt: string;
}): Promise<string> {
  const res = await fetch(`${REPLICATE_BASE_URL}/models/${TEXT_TO_MODEL_ROUTE}/predictions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      input: { prompt: params.prompt, enable_pbr: true },
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.detail ?? `Replicate request failed (${res.status})`);
  }
  return body.id;
}

export async function getTaskStatus(predictionId: string): Promise<ReplicatePrediction> {
  const res = await fetch(`${REPLICATE_BASE_URL}/predictions/${predictionId}`, {
    headers: authHeaders(),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.detail ?? `Replicate status check failed (${res.status})`);
  }
  return body;
}
