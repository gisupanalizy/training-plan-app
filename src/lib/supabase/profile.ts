import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureProfile(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.is_anonymous) throw new Error("Brak aktywnego konta testera.");
  const { error: insertError } = await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
  if (insertError) throw insertError;
  return user;
}
