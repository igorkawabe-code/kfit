-- =============================================
-- KFIT — Schema do Banco de Dados
-- Execute no Supabase: SQL Editor → New Query
-- =============================================

-- 1. Tabela de perfis (estende auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  age integer,
  gender text default 'M',
  bio text,
  color text default '#B4FF00',
  weekly_goal integer default 3,
  created_at timestamptz default now()
);

-- 2. Tabela de treinos
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 3. Tabela de mensagens da IA
create table public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  type text not null,
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, date, type)
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.ai_messages enable row level security;

-- Profiles: todos autenticados podem ler, apenas dono pode escrever
create policy "Profiles visíveis para autenticados"
  on public.profiles for select
  to authenticated using (true);

create policy "Usuário cria próprio perfil"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- Workouts: todos autenticados podem ler (para o ranking), dono escreve
create policy "Treinos visíveis para autenticados"
  on public.workouts for select
  to authenticated using (true);

create policy "Usuário insere próprios treinos"
  on public.workouts for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Usuário deleta próprios treinos"
  on public.workouts for delete
  to authenticated using (auth.uid() = user_id);

-- AI messages: apenas o dono lê/escreve
create policy "Usuário lê próprias mensagens IA"
  on public.ai_messages for select
  to authenticated using (auth.uid() = user_id);

create policy "Usuário insere próprias mensagens IA"
  on public.ai_messages for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Usuário faz upsert de mensagens IA"
  on public.ai_messages for update
  to authenticated using (auth.uid() = user_id);
