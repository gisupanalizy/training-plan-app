import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const email = `t05-ui-${randomUUID()}@example.invalid`;
const password = `T05-ui-${randomUUID()}`;
function ok(result) { if (result.error) throw result.error; return result.data; }
const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
const client = createClient(url, key, options);
ok(await client.auth.signInWithPassword({ email, password }));
ok(await client.from("profiles").insert({ id: user.id }));
const set = { position: 1, kind: "work", repsMin: 6, repsMax: null, isAmrap: false, loadType: "percent_1rm",
  targetKg: null, targetPercent: 75, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null,
  durationSeconds: null, distanceMeters: null, restSeconds: 90, tempo: null, targetRpe: null, targetRir: null, note: null };
const plan = ok(await client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null,
  p_expected_version_id: null, p_document: { name: "Test interfejsu T05", sessions: [{ weekNumber: 1,
    dayLabel: "A", note: null, exercises: [{ exerciseId: null, name: "Przysiad testowy", variant: null,
      equipment: "sztanga", supersetGroup: null, note: null, sets: [set] }] }] } }));
writeFileSync(join(tmpdir(), "t05-ui-fixture.json"), JSON.stringify({ id: user.id, email, password, planId: plan.planId }), { mode: 0o600 });
console.log("Utworzono syntetyczne konto i plan T05; tymczasowe dane testowe zapisano poza repozytorium.");
