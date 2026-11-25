-- =====================================================================
--  CRM - PERSONAS PARTILHADAS COM O FORMADOR
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase. É idempotente.
--
--  No exercício "Construir uma Persona", cada formando cria a sua persona
--  no CRM (módulo Personas) e carrega em "Enviar ao formador". A persona,
--  com a foto fictícia, fica aqui; o formador vê as da turma toda juntas e
--  descarrega cada uma como imagem para o slide.
--
--  A tabela fica fechada (RLS ligado, sem políticas e sem GRANT): só se
--  lá chega pelas funções abaixo, que exigem a sessão da turma - o mesmo
--  desenho dos rascunhos e das entregas.
-- =====================================================================

create table if not exists public.persona_partilhas (
  id            uuid primary key default gen_random_uuid(),
  turma_id      uuid not null references public.turmas(id) on delete cascade,
  user_id       uuid not null references public.utilizadores(id) on delete cascade,
  persona_id    text not null,                 -- o id da persona no CRM do formando
  autor         text not null default '',
  persona       jsonb not null,
  foto          text not null default '',      -- imagem pequena (data URI), já reduzida no browser
  atualizado_em timestamptz not null default now(),
  unique (user_id, persona_id)
);
create index if not exists ix_persona_partilhas_turma on public.persona_partilhas(turma_id);
alter table public.persona_partilhas enable row level security;

-- Enviar (ou voltar a enviar, depois de mudar) -----------------------------
create or replace function public.persona_partilhar(p_token uuid, p_persona_id text, p_persona jsonb, p_foto text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare caller public.utilizadores;
begin
  select * into caller from _user_from_token(p_token);
  if caller.id is null then raise exception 'SESSAO_INVALIDA'; end if;
  if coalesce(btrim(p_persona_id), '') = '' or p_persona is null then raise exception 'DADOS_EM_FALTA'; end if;
  -- a foto chega reduzida (cerca de 30 KB); isto trava um ficheiro absurdo
  if length(coalesce(p_foto, '')) > 400000 or length(p_persona::text) > 60000 then raise exception 'PERSONA_GRANDE'; end if;
  insert into persona_partilhas (turma_id, user_id, persona_id, autor, persona, foto, atualizado_em)
  values (caller.turma_id, caller.id, p_persona_id, btrim(caller.nome || ' ' || coalesce(caller.apelido, '')),
          p_persona, coalesce(p_foto, ''), now())
  on conflict (user_id, persona_id) do update
    set persona = excluded.persona, foto = excluded.foto, autor = excluded.autor, atualizado_em = now();
  return jsonb_build_object('ok', true, 'em', now());
end $$;

-- Retirar uma persona enviada ----------------------------------------------
create or replace function public.persona_retirar(p_token uuid, p_persona_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare caller public.utilizadores;
begin
  select * into caller from _user_from_token(p_token);
  if caller.id is null then raise exception 'SESSAO_INVALIDA'; end if;
  delete from persona_partilhas where user_id = caller.id and persona_id = p_persona_id;
  return jsonb_build_object('ok', true);
end $$;

-- As que eu já enviei (para mostrar "Enviada em ...") ------------------------
create or replace function public.minhas_personas_enviadas(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare caller public.utilizadores;
begin
  select * into caller from _user_from_token(p_token);
  if caller.id is null then raise exception 'SESSAO_INVALIDA'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('persona_id', persona_id, 'em', atualizado_em))
                     from persona_partilhas where user_id = caller.id), '[]'::jsonb);
end $$;

-- As da turma, para o formador ---------------------------------------------
create or replace function public.personas_da_turma(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare caller public.utilizadores;
begin
  select * into caller from _user_from_token(p_token);
  if caller.id is null then raise exception 'SESSAO_INVALIDA'; end if;
  if caller.papel not in ('Formador', 'Administrador') then raise exception 'SEM_PERMISSAO'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
             'id', p.id, 'autor', p.autor, 'persona_id', p.persona_id, 'persona', p.persona,
             'foto', p.foto, 'em', p.atualizado_em) order by lower(p.autor), p.atualizado_em)
           from persona_partilhas p where p.turma_id = caller.turma_id), '[]'::jsonb);
end $$;

revoke all on function public.persona_partilhar(uuid, text, jsonb, text) from public;
revoke all on function public.persona_retirar(uuid, text) from public;
revoke all on function public.minhas_personas_enviadas(uuid) from public;
revoke all on function public.personas_da_turma(uuid) from public;
grant execute on function public.persona_partilhar(uuid, text, jsonb, text) to anon, authenticated;
grant execute on function public.persona_retirar(uuid, text) to anon, authenticated;
grant execute on function public.minhas_personas_enviadas(uuid) to anon, authenticated;
grant execute on function public.personas_da_turma(uuid) to anon, authenticated;
