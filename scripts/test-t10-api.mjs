import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error('Brak konfiguracji lokalnego Supabase.');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const ok = (result, label) => { assert.ifError(result.error, label); return result.data; };
const document = { name: 'Syntetyczny T10', sessions: [{ weekNumber: 1, dayLabel: 'A', note: null,
  exercises: [{ exerciseId: null, name: 'Przysiad T10', variant: null, equipment: 'sztanga',
    supersetGroup: null, note: null, sets: [{ position: 1, kind: 'work', repsMin: 6, repsMax: null,
      isAmrap: false, loadType: 'absolute', targetKg: 90, targetPercent: null,
      bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null,
      durationSeconds: null, distanceMeters: null, restSeconds: 90, tempo: null,
      targetRpe: null, targetRir: null, note: null }] }] }] };
try {
  const clients = [];
  for (const label of ['a', 'b']) {
    const email = `t10-${label}-${randomUUID()}@example.invalid`, password = randomUUID();
    const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'konto');
    users.push(user.id);
    const client = createClient(url, key, options);
    ok(await client.auth.signInWithPassword({ email, password }), 'sesja');
    ok(await client.from('profiles').insert({ id: user.id }), 'profil');
    clients.push(client);
  }
  const [a, b] = clients;
  const operation = { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document };
  const plan = ok(await a.rpc('save_manual_plan', operation), 'publikacja RPC');
  const session = ok(await a.from('plan_sessions').select('*').eq('plan_version_id', plan.versionId).single(), 'dzień');
  const workout = ok(await a.rpc('apply_workout_command', { p_operation_id: randomUUID(), p_workout_id: null,
    p_expected_revision: 0, p_action: 'start', p_payload: { planSessionId: session.id, performedOn: '2026-10-14' } }), 'trening');
  const tables = ['exercises', 'plans', 'plan_versions', 'plan_sessions', 'planned_exercises', 'planned_sets',
    'workout_sessions', 'performed_exercises', 'performed_sets', 'mutation_receipts', 'workout_revisions', 'plan_save_receipts'];
  for (const table of tables) {
    const rows = ok(await a.from(table).select('*'), `odczyt ${table}`);
    assert.ok(rows.length, `fixture ${table}`);
    assert.deepEqual(ok(await b.from(table).select('*'), `B ${table}`), [], `B nie odczytuje A: ${table}`);
    const anonymous = await anon.from(table).select('*');
    assert.ok(anonymous.error || anonymous.data.length === 0, `anon ${table}`);
    const row = rows[0];
    const predicate = query => row.id ? query.eq('id', row.id) : query.eq('owner_id', users[0]);
    for (const client of [a, b, anon]) {
      // Kod 42501 dowodzi braku grantu, a nie przypadkowej odmowy walidatora/triggera.
      assert.equal((await client.from(table).insert(row)).error?.code, '42501', `INSERT ${table}`);
      const column = row.name !== undefined ? 'name' : row.note !== undefined ? 'note' : 'owner_id';
      assert.equal((await predicate(client.from(table).update({ [column]: row[column] }))).error?.code, '42501', `UPDATE ${table}`);
      assert.equal((await predicate(client.from(table).delete())).error?.code, '42501', `DELETE ${table}`);
    }
  }
  assert.deepEqual(ok(await a.rpc('save_manual_plan', operation), 'retry po zamknięciu DML'), plan);
  const changed = { ...operation, p_operation_id: randomUUID(), p_plan_id: plan.planId, p_expected_version_id: plan.versionId,
    p_document: { ...document, name: 'Nowa wersja T10' } };
  const next = ok(await a.rpc('save_manual_plan', changed), 'kolejna wersja przez RPC');
  assert.notEqual(next.versionId, plan.versionId);
  assert.equal(ok(await a.from('plan_versions').select('id').eq('plan_id', plan.planId), 'wersje').length, 2);
  assert.equal(ok(await a.from('workout_sessions').select('plan_version_id').eq('id', workout.workoutId).single(), 'historia').plan_version_id, plan.versionId);
  assert.equal((await b.rpc('save_manual_plan', { ...changed, p_operation_id: randomUUID() })).error?.code, 'P0002');
  const foreignExercise = ok(await a.from('exercises').select('id').limit(1).single(), 'katalog A');
  assert.ok((await b.from('one_rep_max_records').insert({ owner_id: users[1], exercise_id: foreignExercise.id,
    value_kg: 100, effective_on: '2026-10-14', client_operation_id: randomUUID() })).error, '1RM nie wskazuje cudzego ćwiczenia');
  for (const client of clients) await client.auth.signOut({ scope: 'local' });
  console.log('T10 Auth/PostgREST: PASS — 12 tabel, A/B/anon, INSERT/UPDATE/DELETE 42501, publikacja/retry/wersje/historia przez RPC. Dane syntetyczne.');
} finally {
  for (const id of users) ok(await admin.auth.admin.deleteUser(id), 'sprzątanie konta T10');
}
