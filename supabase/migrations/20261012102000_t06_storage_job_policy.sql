-- Zalogowany użytkownik nie może ominąć limitu zadań przez bezpośredni upload
-- niepowiązanych obiektów do prywatnego bucketa importu.
drop policy import_insert_owner on storage.objects;
create policy import_insert_owner on storage.objects for insert to authenticated
with check (
  bucket_id='training-imports'
  and owner_id=(select auth.uid()::text)
  and exists (
    select 1 from public.imports job
    where job.owner_id=(select auth.uid())
      and job.source_path=name
      and job.status='upload_pending'
      and job.expires_at>now()
  )
);
