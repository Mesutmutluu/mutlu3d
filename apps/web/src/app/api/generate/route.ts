import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { Provider } from "@mutlu3d/shared";
import {
  createImageToModelTask,
  createTextToModelTask as createTripoTextToModelTask,
  uploadImage,
} from "@/lib/tripo";
import { createTextToModelTask as createReplicateTextToModelTask } from "@/lib/replicate";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const mode = form.get("mode");

  try {
    let providerTaskId: string;
    let provider: Provider;
    let type: "text_to_model" | "image_to_model";
    let prompt: string | null = null;

    if (mode === "image") {
      const file = form.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Görsel gerekli" }, { status: 400 });
      }
      const imageToken = await uploadImage(file, file.name);
      providerTaskId = await createImageToModelTask({ imageToken });
      provider = "tripo";
      type = "image_to_model";
    } else {
      prompt = String(form.get("prompt") ?? "").trim();
      if (!prompt) {
        return NextResponse.json({ error: "Açıklama gerekli" }, { status: 400 });
      }
      // Replicate (Hunyuan3D-3.1) is ~2x cheaper than Tripo3D, so we try it
      // first for text prompts when enabled. If Replicate's backend is
      // unavailable at creation time, we fall back to Tripo3D immediately.
      // Failures that only show up *after* creation (during async
      // processing) are handled by the polling route (see [id]/route.ts).
      //
      // REPLICATE_ENABLED is a temporary kill switch: Replicate's hosted
      // tencent/hunyuan-3d-3.1 has been failing ~100% of the time with
      // "Resources are insufficient" (their infra, not ours), and every
      // failed attempt still costs ~2 minutes before falling back to
      // Tripo3D. Flip this back to "true" in .env.local once Replicate
      // recovers to resume the cost savings.
      if (process.env.REPLICATE_ENABLED === "true") {
        try {
          providerTaskId = await createReplicateTextToModelTask({ prompt });
          provider = "replicate";
        } catch {
          providerTaskId = await createTripoTextToModelTask({ prompt });
          provider = "tripo";
        }
      } else {
        providerTaskId = await createTripoTextToModelTask({ prompt });
        provider = "tripo";
      }
      type = "text_to_model";
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        type,
        prompt,
        provider,
        provider_task_id: providerTaskId,
        status: "queued",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ generation: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Üretim başlatılamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
