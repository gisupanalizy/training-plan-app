import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET } from "./server";

export function authorizedCleanup(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const a = Buffer.from(header.slice(7));
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function cleanupImports(admin: SupabaseClient, now = new Date(), limit = 50) {
  const { data, error } = await admin.from("imports").select("id,owner_id,source_path")
    .or(`status.eq.cancelled,expires_at.lt.${now.toISOString()}`).order("created_at").limit(limit);
  if (error) throw error;
  const result = { deleted: 0, failed: 0, voiceDeleted: 0 };
  for (let index = 0; index < (data?.length ?? 0); index += 5) {
    const batch = data!.slice(index, index + 5);
    const outcomes = await Promise.all(batch.map(async (job) => {
      if (job.source_path) {
        const removed = await admin.storage.from(BUCKET).remove([job.source_path]);
        if (removed.error) return false;
      }
      const deleted = await admin.from("imports").delete().eq("id", job.id).eq("owner_id", job.owner_id);
      return !deleted.error;
    }));
    for (const success of outcomes) if (success) result.deleted++; else result.failed++;
  }
  const voice = await admin.from("voice_attempts").delete().lt("created_at", new Date(now.getTime() - 7 * 86_400_000).toISOString()).select("id");
  if (voice.error) result.failed++;
  else result.voiceDeleted = voice.data?.length ?? 0;
  return result;
}
