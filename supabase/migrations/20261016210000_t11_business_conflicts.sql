-- T11: konflikty biznesowe nie mogą uruchamiać ponowień serializacji PostgREST.
-- Zmieniamy wyłącznie kod błędu w istniejących funkcjach; bez zmiany danych,
-- snapshotów, receipts, sygnatur, SECURITY DEFINER, search_path i grantów.
do $migration$
declare
  function_signature regprocedure;
  definition text;
  expected_count integer;
  actual_count integer;
  old_fragment constant text := 'errcode = ''40001''';
begin
  foreach function_signature in array array[
    'public.save_manual_plan(uuid,uuid,uuid,jsonb)'::regprocedure,
    'public.apply_workout_command(uuid,uuid,integer,text,jsonb)'::regprocedure
  ] loop
    definition := pg_get_functiondef(function_signature);
    expected_count := case when function_signature =
      'public.save_manual_plan(uuid,uuid,uuid,jsonb)'::regprocedure then 1 else 4 end;
    actual_count := (length(definition) - length(replace(definition, old_fragment, ''))) / length(old_fragment);
    if actual_count <> expected_count then
      raise exception 'Unexpected conflict definition in %: expected %, found %',
        function_signature, expected_count, actual_count;
    end if;
    execute replace(definition, old_fragment, 'errcode = ''PT409''');
  end loop;
end
$migration$;
