create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website text,
  primary_color text not null default '#0f766e',
  support_email text,
  phone text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('owner', 'admin', 'agent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table company_knowledge (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  category text not null,
  content text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text not null,
  price_label text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  question text not null,
  answer text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table chatbot_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  greeting text not null,
  tone text not null default 'professional',
  handoff_email text,
  collect_booking_after_interest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lead_form_fields (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  label text not null,
  field_type text not null,
  required boolean not null default false,
  sort_order integer not null default 0,
  conditions jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_name text not null,
  email text not null,
  phone text not null,
  service_interest text not null,
  booking_date date,
  booking_time time,
  lead_source text not null default 'Chatbot',
  lead_score integer not null default 0,
  status text not null default 'New',
  notes text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lead_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  requested_date date not null,
  requested_time time not null,
  approved_date date,
  approved_time time,
  status text not null default 'Pending Approval',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table availability_slots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slot_date, slot_time)
);

create table booking_status_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table email_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table analytics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  event_name text not null,
  event_value numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_admins_company_id on admins(company_id);
create index idx_company_knowledge_company_enabled on company_knowledge(company_id, enabled);
create index idx_services_company_enabled on services(company_id, enabled);
create index idx_faqs_company_enabled on faqs(company_id, enabled);
create index idx_leads_company_status_created on leads(company_id, status, created_at desc);
create index idx_lead_messages_company_session on lead_messages(company_id, session_id, created_at);
create index idx_bookings_company_status on bookings(company_id, status, requested_date);
create index idx_availability_slots_company_date on availability_slots(company_id, slot_date, slot_time);
create index idx_email_logs_company_status on email_logs(company_id, status);
create index idx_analytics_company_event_created on analytics(company_id, event_name, created_at desc);

alter table companies enable row level security;
alter table admins enable row level security;
alter table company_knowledge enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table chatbot_settings enable row level security;
alter table lead_form_fields enable row level security;
alter table leads enable row level security;
alter table lead_messages enable row level security;
alter table bookings enable row level security;
alter table availability_slots enable row level security;
alter table booking_status_logs enable row level security;
alter table email_logs enable row level security;
alter table analytics enable row level security;

create policy "admins can read own company" on companies
  for select using (id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage company scoped rows" on company_knowledge
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage services" on services
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage faqs" on faqs
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage settings" on chatbot_settings
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage form fields" on lead_form_fields
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage leads" on leads
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage messages" on lead_messages
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage bookings" on bookings
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can manage availability" on availability_slots
  for all using (company_id in (select company_id from admins where admins.id = auth.uid()))
  with check (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can read logs" on booking_status_logs
  for select using (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can read email logs" on email_logs
  for select using (company_id in (select company_id from admins where admins.id = auth.uid()));

create policy "admins can read analytics" on analytics
  for select using (company_id in (select company_id from admins where admins.id = auth.uid()));
