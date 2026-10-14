-- T03: prywatny bucket; ścieżka każdego obiektu zaczyna się od UUID właściciela.
insert into storage.buckets (id, name, public)
values ('training-private', 'training-private', false)
on conflict (id) do update set public = false;

create policy "training_private_select_owner" on storage.objects
  for select to authenticated
  using (bucket_id = 'training-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text));

create policy "training_private_insert_owner" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'training-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text));

create policy "training_private_update_owner" on storage.objects
  for update to authenticated
  using (bucket_id = 'training-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text))
  with check (bucket_id = 'training-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text));

create policy "training_private_delete_owner" on storage.objects
  for delete to authenticated
  using (bucket_id = 'training-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text));
