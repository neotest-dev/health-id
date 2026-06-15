create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  dni text unique not null,
  full_name text,
  role text not null check (role in ('admin', 'doctor')),
  created_at timestamptz not null default now()
);

create table if not exists especialidades (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists doctor_details (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references profiles(id) on delete cascade,
  especialidad_id uuid references especialidades(id) on delete set null,
  turno text not null check (turno in ('manana', 'tarde')),
  updated_at timestamptz not null default now()
);

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  dni_hash text unique not null,
  datos_cifrados text not null,
  llave_aes_cifrada text not null,
  iv text not null,
  auth_tag text not null,
  llave_privada_rsa text not null,
  descriptor_facial jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists citas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  paciente_id uuid not null references pacientes(id) on delete cascade,
  especialidad_id uuid not null references especialidades(id) on delete restrict,
  turno text not null check (turno in ('manana', 'tarde')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'atendida', 'cancelada')),
  doctor_profile_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table especialidades enable row level security;
alter table doctor_details enable row level security;
alter table pacientes enable row level security;
alter table citas enable row level security;

drop policy if exists "profiles service role" on profiles;
drop policy if exists "especialidades service role" on especialidades;
drop policy if exists "doctor_details service role" on doctor_details;
drop policy if exists "pacientes service role" on pacientes;
drop policy if exists "citas service role" on citas;

create policy "profiles service role" on profiles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "especialidades service role" on especialidades for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "doctor_details service role" on doctor_details for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "pacientes service role" on pacientes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "citas service role" on citas for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Crea tu admin desde Supabase Auth y luego registra manualmente su perfil:
-- insert into profiles (id, dni, full_name, role) values ('<uuid-auth-user>', '00000000', 'Administrador', 'admin');
