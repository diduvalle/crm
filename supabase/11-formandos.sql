-- =====================================================================
--  CRM - FORMANDOS (a memória de quem já fez formação contigo)
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase. É idempotente: pode
--  voltar a correr-se sem estragar nada.
--
--  TRÊS IDEIAS QUE EXPLICAM O RESTO:
--
--  1. UMA PESSOA = UM EMAIL. A pessoa reconhece-se pela `email_chave`,
--     não pelo email como foi escrito. Na chave, maiúsculas e espaços
--     não contam, e num Gmail também não contam os pontos nem o que vem
--     depois de um `+` - o próprio Gmail entrega `joao.silva@` e
--     `joaosilva+tp@` na mesma caixa, por isso são a mesma pessoa.
--
--  2. UMA FORMAÇÃO = CURSO + ENTIDADE + DATA DE INÍCIO. Dois ficheiros
--     da mesma formação não a duplicam. O curso e a entidade comparam-se
--     sem maiúsculas, mas escritos de outra maneira são outra formação:
--     é por isso que o modelo de Excel os dá a escolher de uma lista.
--
--  3. O REPO NUNCA JUNTA DUAS PESSOAS SOZINHO POR CAUSA DO NOME. Dois
--     "João Silva" podem ser duas pessoas. O nome parecido só gera uma
--     sugestão; quem decide é o formador. Quando decide que são pessoas
--     diferentes, fica guardado (`formandos_distintos`) para o Repo não
--     voltar a perguntar.
-- =====================================================================

create table if not exists public.formandos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  apelido       text not null default '',
  email         text not null,                 -- como foi escrito
  email_chave   text not null unique,          -- o que reconhece a pessoa
  notas         text not null default '',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.formacoes (
  id        uuid primary key default gen_random_uuid(),
  curso     text not null,
  entidade  text not null,
  inicio    date,
  fim       date,
  criado_em timestamptz not null default now()
);
create unique index if not exists formacoes_unica
  on public.formacoes (lower(curso), lower(entidade), coalesce(inicio, date '1900-01-01'));

create table if not exists public.formando_formacoes (
  formando_id uuid not null references public.formandos(id) on delete cascade,
  formacao_id uuid not null references public.formacoes(id) on delete cascade,
  primary key (formando_id, formacao_id)
);

-- Pares que o formador já disse serem pessoas diferentes. a < b sempre,
-- para o mesmo par não poder ficar guardado duas vezes ao contrário.
create table if not exists public.formandos_distintos (
  a uuid not null references public.formandos(id) on delete cascade,
  b uuid not null references public.formandos(id) on delete cascade,
  primary key (a, b),
  check (a < b)
);

alter table public.formandos           enable row level security;
alter table public.formacoes           enable row level security;
alter table public.formando_formacoes  enable row level security;
alter table public.formandos_distintos enable row level security;

-- A chave de uma pessoa -------------------------------------------------
create or replace function public._formando_chave(p_email text)
returns text language sql immutable as $$
  select case
           when split_part(e, '@', 2) in ('gmail.com', 'googlemail.com')
             then replace(split_part(split_part(e, '@', 1), '+', 1), '.', '') || '@gmail.com'
           else e
         end
    from (select lower(btrim(coalesce(p_email, ''))) as e) x
$$;

-- Toda a gente, com as formações de cada um ------------------------------
create or replace function public.formandos_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return json_build_object(
    'formandos', coalesce((
      select json_agg(json_build_object(
               'id', f.id, 'nome', f.nome, 'apelido', f.apelido, 'email', f.email,
               'notas', f.notas, 'criado_em', f.criado_em,
               'formacoes', coalesce((
                 select json_agg(json_build_object(
                          'id', c.id, 'curso', c.curso, 'entidade', c.entidade,
                          'inicio', c.inicio, 'fim', c.fim)
                        order by c.inicio desc nulls last, c.curso)
                   from formando_formacoes ff
                   join formacoes c on c.id = ff.formacao_id
                  where ff.formando_id = f.id), '[]'::json))
             order by lower(f.nome), lower(f.apelido))
        from formandos f), '[]'::json),
    'distintos', coalesce((select json_agg(json_build_array(d.a, d.b)) from formandos_distintos d), '[]'::json)
  );
end $$;

-- Carregar o Excel -------------------------------------------------------
--   p_linhas: [{linha, nome, apelido, email, curso, entidade, inicio, fim, notas}]
--   (datas em 'aaaa-mm-dd' ou vazias)
--   p_ensaio = true: só conta, não grava. É o que alimenta a
--   pré-visualização - a mesma função, para o que se vê antes de gravar
--   ser exactamente o que se grava.
--
--   Uma pessoa que já existe NÃO tem o nome reescrito: se o formador o
--   corrigiu no Repo, um Excel antigo não o desfaz. Só se preenche o
--   apelido que estiver vazio e se acrescentam notas novas.
create or replace function public.formandos_importar(p_token uuid, p_linhas jsonb, p_ensaio boolean default true)
returns json language plpgsql security definer set search_path = public as $$
declare
  r jsonb;
  v_nome text; v_ap text; v_email text; v_chave text;
  v_curso text; v_ent text; v_ini date; v_fim date; v_notas text;
  v_fid uuid; v_cid uuid; k_form text;
  erros jsonb := '[]'::jsonb;
  n_validas int := 0; n_novas int := 0; n_exist int := 0; n_form int := 0; n_lig int := 0;
  vistas_pessoas text[] := '{}'; vistas_form text[] := '{}';
begin
  perform _repo_root(p_token);

  for r in select * from jsonb_array_elements(coalesce(p_linhas, '[]'::jsonb)) loop
    v_nome  := btrim(coalesce(r->>'nome', ''));
    v_ap    := btrim(coalesce(r->>'apelido', ''));
    v_email := btrim(coalesce(r->>'email', ''));
    v_curso := btrim(coalesce(r->>'curso', ''));
    v_ent   := btrim(coalesce(r->>'entidade', ''));
    v_notas := btrim(coalesce(r->>'notas', ''));

    if v_nome = '' or v_email = '' or v_curso = '' or v_ent = '' then
      erros := erros || jsonb_build_object('linha', r->'linha', 'motivo', 'faltam campos obrigatórios');
      continue;
    end if;
    if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      erros := erros || jsonb_build_object('linha', r->'linha', 'motivo', 'email inválido: ' || v_email);
      continue;
    end if;
    begin v_ini := nullif(r->>'inicio', '')::date; exception when others then v_ini := null; end;
    begin v_fim := nullif(r->>'fim', '')::date;    exception when others then v_fim := null; end;

    n_validas := n_validas + 1;
    v_chave := _formando_chave(v_email);
    k_form  := lower(v_curso) || '|' || lower(v_ent) || '|' || coalesce(v_ini::text, '');

    -- contar ANTES de gravar: em ensaio é tudo o que se faz; a sério,
    -- a mesma contagem diz o que esta linha trouxe de novo
    if not (v_chave = any(vistas_pessoas)) then
      vistas_pessoas := vistas_pessoas || v_chave;
      if exists (select 1 from formandos where email_chave = v_chave)
        then n_exist := n_exist + 1; else n_novas := n_novas + 1; end if;
    end if;
    if not (k_form = any(vistas_form)) then
      vistas_form := vistas_form || k_form;
      if not exists (select 1 from formacoes
                      where lower(curso) = lower(v_curso) and lower(entidade) = lower(v_ent)
                        and coalesce(inicio, date '1900-01-01') = coalesce(v_ini, date '1900-01-01'))
        then n_form := n_form + 1; end if;
    end if;

    if not p_ensaio then
      insert into formandos(nome, apelido, email, email_chave, notas)
        values (v_nome, v_ap, v_email, v_chave, v_notas)
      on conflict (email_chave) do update set
        apelido = case when formandos.apelido = '' then excluded.apelido else formandos.apelido end,
        notas   = case when excluded.notas = '' or position(excluded.notas in formandos.notas) > 0 then formandos.notas
                       when formandos.notas = '' then excluded.notas
                       else formandos.notas || E'\n' || excluded.notas end,
        atualizado_em = now()
      returning id into v_fid;

      insert into formacoes(curso, entidade, inicio, fim)
        values (v_curso, v_ent, v_ini, v_fim)
      on conflict (lower(curso), lower(entidade), coalesce(inicio, date '1900-01-01'))
        do update set fim = coalesce(formacoes.fim, excluded.fim)
      returning id into v_cid;

      insert into formando_formacoes(formando_id, formacao_id) values (v_fid, v_cid)
        on conflict do nothing;
      if found then n_lig := n_lig + 1; end if;
    end if;
  end loop;

  return json_build_object(
    'ensaio', p_ensaio, 'validas', n_validas,
    'pessoas_novas', n_novas, 'pessoas_existentes', n_exist,
    'formacoes_novas', n_form, 'ligacoes', n_lig, 'erros', erros);
end $$;

-- Editar uma ficha --------------------------------------------------------
create or replace function public.formando_gravar(p_token uuid, p_id uuid, p_dados jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_nome  text := btrim(coalesce(p_dados->>'nome', ''));
  v_email text := btrim(coalesce(p_dados->>'email', ''));
  v_chave text;
begin
  perform _repo_root(p_token);
  if v_nome = '' or v_email = '' then raise exception 'DADOS_EM_FALTA'; end if;
  v_chave := _formando_chave(v_email);
  -- mudar para o email de outra pessoa seria juntá-las às escondidas
  if exists (select 1 from formandos where email_chave = v_chave and id <> p_id) then
    raise exception 'EMAIL_DE_OUTRO';
  end if;
  update formandos set
      nome = v_nome,
      apelido = btrim(coalesce(p_dados->>'apelido', '')),
      email = v_email, email_chave = v_chave,
      notas = btrim(coalesce(p_dados->>'notas', '')),
      atualizado_em = now()
    where id = p_id;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

-- Juntar duas fichas que são a mesma pessoa ----------------------------------
--   Fica a ficha p_fica (e o email dela); as formações da outra passam
--   para cá, as notas acrescentam-se, e a outra desaparece.
create or replace function public.formandos_juntar(p_token uuid, p_fica uuid, p_sai uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s public.formandos;
begin
  perform _repo_root(p_token);
  if p_fica = p_sai then raise exception 'DADOS_EM_FALTA'; end if;
  select * into s from formandos where id = p_sai;
  if s.id is null or not exists (select 1 from formandos where id = p_fica) then
    raise exception 'NAO_ENCONTRADO';
  end if;

  insert into formando_formacoes(formando_id, formacao_id)
    select p_fica, ff.formacao_id from formando_formacoes ff where ff.formando_id = p_sai
  on conflict do nothing;

  update formandos f set
      apelido = case when f.apelido = '' then s.apelido else f.apelido end,
      notas   = case when s.notas = '' or position(s.notas in f.notas) > 0 then f.notas
                     when f.notas = '' then s.notas
                     else f.notas || E'\n' || s.notas end,
      atualizado_em = now()
    where f.id = p_fica;

  delete from formandos where id = p_sai;   -- leva as ligações atrás
  return json_build_object('ok', true);
end $$;

-- "São pessoas diferentes": não voltar a sugerir este par ----------------------
create or replace function public.formandos_distintos_marcar(p_token uuid, p_a uuid, p_b uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  if p_a = p_b then raise exception 'DADOS_EM_FALTA'; end if;
  insert into formandos_distintos(a, b) values (least(p_a, p_b), greatest(p_a, p_b))
    on conflict do nothing;
  return json_build_object('ok', true);
end $$;

-- Apagar uma ficha --------------------------------------------------------
create or replace function public.formando_apagar(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  delete from formandos where id = p_id;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

revoke all on function public.formandos_listar(uuid) from public, anon;
revoke all on function public.formandos_importar(uuid, jsonb, boolean) from public, anon;
revoke all on function public.formando_gravar(uuid, uuid, jsonb) from public, anon;
revoke all on function public.formandos_juntar(uuid, uuid, uuid) from public, anon;
revoke all on function public.formandos_distintos_marcar(uuid, uuid, uuid) from public, anon;
revoke all on function public.formando_apagar(uuid, uuid) from public, anon;

grant execute on function public.formandos_listar(uuid) to anon, authenticated;
grant execute on function public.formandos_importar(uuid, jsonb, boolean) to anon, authenticated;
grant execute on function public.formando_gravar(uuid, uuid, jsonb) to anon, authenticated;
grant execute on function public.formandos_juntar(uuid, uuid, uuid) to anon, authenticated;
grant execute on function public.formandos_distintos_marcar(uuid, uuid, uuid) to anon, authenticated;
grant execute on function public.formando_apagar(uuid, uuid) to anon, authenticated;
