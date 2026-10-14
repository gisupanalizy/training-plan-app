-- Oddzielny prywatny bucket importu: Storage egzekwuje limit przed zapisaniem pliku.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('training-imports','training-imports',false,2097152,array['application/pdf','image/png','image/jpeg'])
on conflict (id) do update set public=false,file_size_limit=2097152,allowed_mime_types=array['application/pdf','image/png','image/jpeg'];
create policy import_select_owner on storage.objects for select to authenticated
 using (bucket_id='training-imports' and (storage.foldername(name))[1]=(select auth.uid()::text) and owner_id=(select auth.uid()::text));
create policy import_insert_owner on storage.objects for insert to authenticated
 with check (bucket_id='training-imports' and (storage.foldername(name))[1]=(select auth.uid()::text) and owner_id=(select auth.uid()::text));
create policy import_delete_owner on storage.objects for delete to authenticated
 using (bucket_id='training-imports' and (storage.foldername(name))[1]=(select auth.uid()::text) and owner_id=(select auth.uid()::text));
