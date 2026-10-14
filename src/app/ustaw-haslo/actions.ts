"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 12) redirect("/ustaw-haslo?blad=dlugosc");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/logowanie?powod=sesja");
  const result = await supabase.auth.updateUser({ password });
  if (result.error) redirect("/ustaw-haslo?blad=zapis");
  redirect("/profil");
}
