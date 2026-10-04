import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIX = ".tripo3d.com";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url gerekli" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Geçersiz url" }, { status: 400 });
  }

  if (!parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)) {
    return NextResponse.json({ error: "İzin verilmeyen host" }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Model alınamadı" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "model/gltf-binary",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
