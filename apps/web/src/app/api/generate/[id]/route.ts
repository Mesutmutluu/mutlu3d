import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isTerminalStatus } from "@mutlu3d/shared";
import {
  createTextToModelTask as createTripoTextToModelTask,
  getTaskStatus as getTripoStatus,
} from "@/lib/tripo";
import { getTaskStatus as getReplicateStatus } from "@/lib/replicate";
import { supabaseAdmin } from "@/lib/supabase";

function normalizeReplicateStatus(status: string): string {
  switch (status) {
    case "starting":
    case "processing":
      return "running";
    case "succeeded":
      return "success";
    case "canceled":
      return "cancelled";
    default:
      return status;
  }
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/generate/[id]">
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = supabaseAdmin();

  const { data: generation, error: fetchError } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !generation) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  if (isTerminalStatus(generation.status)) {
    return NextResponse.json({ generation });
  }

  try {
    if (generation.provider === "replicate") {
      const task = await getReplicateStatus(generation.provider_task_id);
      const status = normalizeReplicateStatus(task.status);

      if (status === "failed" || status === "cancelled") {
        // Replicate failed mid-flight (this happens *after* the task was
        // already created successfully, so it can't be caught at creation
        // time). Fail over to Tripo3D transparently — the client keeps
        // polling this same `id` and never notices the provider swap.
        const tripoTaskId = await createTripoTextToModelTask({
          prompt: generation.prompt ?? "",
        });
        const { data: updated, error: updateError } = await supabase
          .from("generations")
          .update({ provider: "tripo", provider_task_id: tripoTaskId, status: "queued" })
          .eq("id", id)
          .select()
          .single();
        if (updateError) throw updateError;
        return NextResponse.json({ generation: updated });
      }

      const { data: updated, error: updateError } = await supabase
        .from("generations")
        .update({
          status,
          model_url: status === "success" ? task.output ?? null : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return NextResponse.json({ generation: updated });
    }

    const task = await getTripoStatus(generation.provider_task_id);
    const status = task.status.toLowerCase();

    const { data: updated, error: updateError } = await supabase
      .from("generations")
      .update({
        status,
        model_url: task.output?.pbr_model ?? task.output?.model ?? null,
        rendered_image_url: task.output?.rendered_image ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ generation: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Durum alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
