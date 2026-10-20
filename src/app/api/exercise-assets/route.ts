import { readdirSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const filePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|svg)$/;

export async function GET(request: Request) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public/exercise-assets"))
      .filter((file) => filePattern.test(file) && file !== "generic.png")
      .filter((file) => !query || file.includes(query))
      .sort()
      .slice(0, 24);
  } catch {
    files = [];
  }
  return NextResponse.json({ files });
}
