-- ============================================================
--  SPDA Store — Database Setup
--  Ise Supabase Dashboard → SQL Editor me paste karke "Run" karo
-- ============================================================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  price text not null,
  mrp text,
  image_url text,
  affiliate_link text not null,
  source_url text,
  created_at timestamptz not null default now()
);

-- Row Level Security on karo
alter table products enable row level security;

-- Koi bhi (bina login) products dekh sake — public storefront ke liye zaroori
create policy "Public can view products"
  on products for select
  using (true);

-- Sirf logged-in (OTP se verified) user hi add/edit/delete kar sake
create policy "Authenticated users can insert products"
  on products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on products for update
  to authenticated
  using (true);

create policy "Authenticated users can delete products"
  on products for delete
  to authenticated
  using (true);
