"use client";

import { useEffect, useRef, useState } from "react";
import { STATUS_LABELS, isTerminalStatus } from "@mutlu3d/shared";
import ModelViewer from "./ModelViewer";

type Mode = "text" | "image";

interface Generation {
  id: string;
  status: string;
  model_url: string | null;
  prompt: string | null;
}

export default function GenerateForm() {
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function pollStatus(id: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/generate/${id}`);
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Durum alınamadı");
        stopPolling();
        return;
      }
      setGeneration(body.generation);
      if (isTerminalStatus(body.generation.status)) {
        stopPolling();
      }
    }, 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGeneration(null);
    setSubmitting(true);

    const form = new FormData();
    form.append("mode", mode);
    if (mode === "text") {
      form.append("prompt", prompt);
    } else if (image) {
      form.append("image", image);
    }

    try {
      const res = await fetch("/api/generate", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Üretim başlatılamadı");
        return;
      }
      setGeneration(body.generation);
      pollStatus(body.generation.id);
    } finally {
      setSubmitting(false);
    }
  }

  const isWorking = generation && !isTerminalStatus(generation.status);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-full px-4 py-1.5 ${mode === "text" ? "bg-foreground text-background" : "border border-black/[.08] dark:border-white/[.145]"}`}
        >
          Metinden
        </button>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`rounded-full px-4 py-1.5 ${mode === "image" ? "bg-foreground text-background" : "border border-black/[.08] dark:border-white/[.145]"}`}
        >
          Görselden
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "text" ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: ahşap ayaklı vintage deri koltuk"
            rows={3}
            className="rounded-xl border border-black/[.08] bg-white p-4 text-base dark:border-white/[.145] dark:bg-zinc-900"
            required
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="rounded-xl border border-black/[.08] bg-white p-4 text-sm dark:border-white/[.145] dark:bg-zinc-900"
            required
          />
        )}

        <button
          type="submit"
          disabled={submitting || !!isWorking}
          className="self-start rounded-full bg-foreground px-6 py-3 text-background font-medium disabled:opacity-50"
        >
          {submitting ? "Başlatılıyor..." : "3D Model Üret"}
        </button>
      </form>

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {generation && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Durum: {STATUS_LABELS[generation.status] ?? generation.status}
          </p>

          {isWorking && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full w-1/3 animate-pulse bg-foreground" />
            </div>
          )}

          {generation.status === "success" && generation.model_url && (
            <div className="h-96 w-full overflow-hidden rounded-xl border border-black/[.08] dark:border-white/[.145]">
              <ModelViewer src={generation.model_url} alt={generation.prompt ?? "3D model"} />
            </div>
          )}

          {generation.status === "success" && generation.model_url && (
            <a
              href={generation.model_url}
              download
              className="self-start text-sm font-medium underline"
            >
              Modeli indir (GLB)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
