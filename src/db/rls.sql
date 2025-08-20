alter table public.student_profiles enable row level security;
alter table public.applications enable row level security;
alter table public.education_history enable row level security;
alter table public.test_scores enable row level security;
alter table public.institution_preferences enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;

-- Helpers
create policy "Users can read/write their profile" on public.student_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can CRUD their education history" on public.education_history
  for all using (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  ) with check (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  );

create policy "Users can CRUD their test scores" on public.test_scores
  for all using (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  ) with check (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  );

create policy "Users can CRUD their institution prefs" on public.institution_preferences
  for all using (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  ) with check (
    exists(select 1 from applications a where a.id=application_id and a.user_id=auth.uid())
  );

create policy "Users can CRUD their documents" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read their payments" on public.payments for select using (auth.uid() = user_id);
create policy "Users can insert payments for themselves" on public.payments for insert with check (auth.uid() = user_id);
create policy "Users can update their payments" on public.payments for update using (auth.uid() = user_id);
