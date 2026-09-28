import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ModelViewer from "@/components/ModelViewer";

export default async function GalleryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = supabaseAdmin();

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Galerim</h1>

      {!generations?.length && (
        <p className="text-zinc-600 dark:text-zinc-400">
          Henüz bir model üretmedin.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {generations?.map((g) => (
          <div
            key={g.id}
            className="flex flex-col overflow-hidden rounded-xl border border-black/[.08] dark:border-white/[.145]"
          >
            <div className="h-56 bg-zinc-100 dark:bg-zinc-900">
              {g.status === "success" && g.model_url ? (
                <ModelViewer src={g.model_url} alt={g.prompt ?? "3D model"} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  {g.status}
                </div>
              )}
            </div>
            <div className="p-3 text-sm">
              <p className="truncate">{g.prompt ?? g.type}</p>
              <p className="text-zinc-500">
                {new Date(g.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
