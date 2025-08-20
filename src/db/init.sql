create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  dob date,
  nationality text,
  address text,
  emergency_contact text,
  avatar_url text,
  -- notifications
  notify_email boolean default true,
  notify_whatsapp boolean default false,
  notify_application_updates boolean default true,
  notify_payment_reminders boolean default true,
  notify_accommodation_updates boolean default true,
  notify_announcements boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'in_progress',
  progress numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_applications_user on public.applications(user_id);

-- Education history (1:n)
create table if not exists public.education_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_year text,
  end_year text,
  gpa text
);
create index if not exists idx_edu_app on public.education_history(application_id);

-- Test scores (1:1)
create table if not exists public.test_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.applications(id) on delete cascade,
  sat text, act text, gre text, gmat text, toefl text, ielts text
);

-- Institution preferences (1:1)
create table if not exists public.institution_preferences (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.applications(id) on delete cascade,
  selected_institution_ids text[],
  preferred_program text,
  degree_level text,
  start_term text,
  additional_info text
);

-- Documents (1:n)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  doc_type text,
  status text check (status in ('required','uploaded','verified','rejected')) default 'uploaded',
  storage_path text,
  size_mb numeric,
  uploaded_at timestamptz default now(),
  verified_at timestamptz,
  reviewer_note text
);
create index if not exists idx_docs_user on public.documents(user_id);

-- Payments (1:n)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  payment_type text,
  amount_ghs numeric,
  status text check (status in ('pending','paid','overdue','upcoming')) default 'pending',
  due_date date,
  paid_at timestamptz,
  method text,
  provider_ref text,
  receipt_url text
);
create index if not exists idx_payments_user on public.payments(user_id);

-- Institutions (static/seeded) (optional)
create table if not exists public.institutions (
  id text primary key,
  name text not null,
  location text,
  ranking int,
  tuition text,
  type text check (type in ('shs','tertiary'))
);
