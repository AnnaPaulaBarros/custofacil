-- CustoFacil: schema inicial do banco
-- Execute este arquivo no Supabase em SQL Editor > New query > Run.

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Meu negocio',
  segment text,
  currency text not null default 'EUR' check (currency in ('EUR', 'BRL')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  category text,
  unit text not null default 'unidade',
  production_quantity numeric(14,4) not null default 1 check (production_quantity > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  unit text not null default 'unidade',
  purchase_quantity numeric(14,4) not null check (purchase_quantity > 0),
  purchase_price numeric(14,4) not null check (purchase_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.product_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  quantity_used numeric(14,4) not null check (quantity_used >= 0),
  unique (product_id, material_id)
);

create table if not exists public.labor (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  description text not null,
  hourly_rate numeric(14,4) not null check (hourly_rate >= 0),
  hours numeric(14,4) not null default 0 check (hours >= 0),
  minutes integer not null default 0 check (minutes between 0 and 59)
);

create table if not exists public.indirect_costs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  monthly_value numeric(14,4) not null check (monthly_value >= 0),
  monthly_production numeric(14,4) not null check (monthly_production > 0)
);

create table if not exists public.selling_costs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  percentage numeric(7,4) not null check (percentage >= 0 and percentage <= 100),
  enabled boolean not null default true
);

create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  desired_margin numeric(7,4) not null default 0 check (desired_margin >= 0 and desired_margin < 100),
  loss_percentage numeric(7,4) not null default 0 check (loss_percentage >= 0 and loss_percentage < 100),
  markup numeric(14,4),
  total_cost numeric(14,4) not null default 0,
  suggested_price numeric(14,4) not null default 0,
  estimated_profit numeric(14,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_user_id_idx on public.businesses(user_id);
create index if not exists products_business_id_idx on public.products(business_id);
create index if not exists materials_business_id_idx on public.materials(business_id);
create index if not exists indirect_costs_business_id_idx on public.indirect_costs(business_id);
create index if not exists pricing_product_id_idx on public.pricing(product_id);

-- Cria automaticamente um negocio para cada novo usuario.
create or replace function public.create_default_business()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.businesses (user_id, name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Meu negocio'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_default_business();

-- Atualiza updated_at sem depender do frontend.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists pricing_set_updated_at on public.pricing;
create trigger pricing_set_updated_at before update on public.pricing
for each row execute procedure public.set_updated_at();

-- RLS: o usuario so pode ver e alterar dados do proprio negocio.
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.materials enable row level security;
alter table public.product_materials enable row level security;
alter table public.labor enable row level security;
alter table public.indirect_costs enable row level security;
alter table public.selling_costs enable row level security;
alter table public.pricing enable row level security;

drop policy if exists businesses_owner_policy on public.businesses;
create policy businesses_owner_policy on public.businesses
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists products_owner_policy on public.products;
create policy products_owner_policy on public.products
for all using (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()));

drop policy if exists materials_owner_policy on public.materials;
create policy materials_owner_policy on public.materials
for all using (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()));

drop policy if exists indirect_costs_owner_policy on public.indirect_costs;
create policy indirect_costs_owner_policy on public.indirect_costs
for all using (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid()));

drop policy if exists product_materials_owner_policy on public.product_materials;
create policy product_materials_owner_policy on public.product_materials
for all using (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()));

drop policy if exists labor_owner_policy on public.labor;
create policy labor_owner_policy on public.labor
for all using (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()));

drop policy if exists selling_costs_owner_policy on public.selling_costs;
create policy selling_costs_owner_policy on public.selling_costs
for all using (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()));

drop policy if exists pricing_owner_policy on public.pricing;
create policy pricing_owner_policy on public.pricing
for all using (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()))
with check (exists (select 1 from public.products p join public.businesses b on b.id = p.business_id where p.id = product_id and b.user_id = auth.uid()));
