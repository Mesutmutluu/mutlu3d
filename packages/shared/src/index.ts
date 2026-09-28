export type GenerationType = "text_to_model" | "image_to_model";

export type GenerationStatus =
  | "queued"
  | "submitted"
  | "running"
  | "processing"
  | "success"
  | "failed"
  | "banned"
  | "expired"
  | "cancelled";

export const TERMINAL_STATUSES: readonly GenerationStatus[] = [
  "success",
  "failed",
  "banned",
  "expired",
  "cancelled",
];

export function isTerminalStatus(status: string): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export const STATUS_LABELS: Record<string, string> = {
  queued: "Sırada",
  submitted: "Sırada",
  running: "Üretiliyor",
  processing: "Üretiliyor",
  success: "Tamamlandı",
  failed: "Başarısız",
  banned: "Reddedildi",
  expired: "Süresi doldu",
  cancelled: "İptal edildi",
};

export type Provider = "tripo" | "replicate";

export interface GenerationRow {
  id: string;
  user_id: string;
  type: GenerationType;
  prompt: string | null;
  provider: Provider;
  provider_task_id: string;
  status: string;
  model_url: string | null;
  rendered_image_url: string | null;
  created_at: string;
}
