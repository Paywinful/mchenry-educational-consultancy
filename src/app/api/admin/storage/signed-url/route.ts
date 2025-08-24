import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  const userClient = await supabaseRoute();
  const { data: { user }, error: uErr } = await userClient.auth.getUser();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin, error: aErr } = await userClient.rpc("is_admin");
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  let path = url.searchParams.get("path") || "";
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  path = decodeURIComponent(path).replace(/^\/+/, "").replace(/^documents\//, "");
  if (path.includes("..")) return NextResponse.json({ error: "Invalid path" }, { status: 400 });

  const expiresRaw = parseInt(url.searchParams.get("expires") || "60", 10);
  const expires = Number.isFinite(expiresRaw) ? Math.min(3600, Math.max(10, expiresRaw)) : 60;

  const downloadFlag = url.searchParams.get("download") === "1";
  const fileName = url.searchParams.get("filename") || undefined;

  // ✅ createSignedUrl options: { download?: string | boolean }
  const options = downloadFlag ? { download: (fileName || true) } : undefined;

  const adminDb = supabaseAdmin();
  const { data, error } = await adminDb.storage
    .from("documents")
    .createSignedUrl(path, expires, options);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.signedUrl) return NextResponse.json({ error: "Could not sign URL" }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
