-- =====================================================================
--  CRM - CAMPANHAS (anunciar formações a quem já fez formação contigo)
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase, DEPOIS do 11-formandos.sql.
--  É idempotente: pode voltar a correr-se sem estragar nada.
--
--  ATENÇÃO: depois do 13 e do 14, se voltares a correr este, corre o 13
--  e o 14 logo a seguir, por esta ordem. Este repõe as versões antigas de
--  campanha_ler/gravar/preparar/clique, e o construtor de email deixava
--  de gravar e de contar os cliques por formação.
--
--  O EMAIL NÃO SAI DAQUI. Sai do Outlook do formador, pela conta do
--  Turismo de Portugal (Microsoft 365), que nenhum servidor nosso pode
--  usar sem autorização da informática deles. O Repo escreve o email,
--  escolhe os destinatários e prepara uma versão para cada pessoa; um
--  programa no PC envia-as pelo Outlook, uma a uma.
--
--  O QUE SE MANTÉM POR SER UMA A UMA: cada pessoa tem um `token` seu. O
--  link de Inscrever e o de sair da lista levam-no, por isso sabe-se
--  QUEM clicou e QUEM saiu - não só quantos.
--
--  ZONA DE TESTES: o filtro {"tipo":"teste"} manda a campanha a UM só
--  endereço, o de _campanha_email_teste(). Faz o caminho todo, com um
--  envio sem formando por trás - sair da lista numa campanha de teste
--  não tira ninguém de lado nenhum.
--
--  Estados de uma campanha:
--    rascunho  -> a escrever-se
--    preparada -> os destinatários ficaram fixados, um envio por pessoa
--    enviada   -> já não há nenhum envio por fazer
-- =====================================================================

alter table public.formandos add column if not exists saiu_em timestamptz;

create table if not exists public.campanhas (
  id            uuid primary key default gen_random_uuid(),
  assunto       text not null default '',
  corpo         text not null default '',
  botao_texto   text not null default '',
  botao_link    text not null default '',
  filtro        jsonb not null default '{"tipo":"todos"}'::jsonb,
  estado        text not null default 'rascunho' check (estado in ('rascunho','preparada','enviada')),
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  enviada_em    timestamptz
);

create table if not exists public.campanha_envios (
  id              uuid primary key default gen_random_uuid(),
  campanha_id     uuid not null references public.campanhas(id) on delete cascade,
  formando_id     uuid references public.formandos(id) on delete set null,
  email           text not null,
  nome            text not null default '',
  token           uuid not null unique default gen_random_uuid(),
  estado          text not null default 'por_enviar' check (estado in ('por_enviar','enviado','erro')),
  enviado_em      timestamptz,
  erro            text not null default '',
  cliques         int not null default 0,
  primeiro_clique timestamptz,
  saiu_em         timestamptz,
  unique (campanha_id, formando_id)
);

alter table public.campanhas       enable row level security;
alter table public.campanha_envios enable row level security;

-- A lista, agora com quem saiu ------------------------------------------
create or replace function public.formandos_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return json_build_object(
    'formandos', coalesce((
      select json_agg(json_build_object(
               'id', f.id, 'nome', f.nome, 'apelido', f.apelido, 'email', f.email,
               'notas', f.notas, 'criado_em', f.criado_em, 'saiu_em', f.saiu_em,
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

-- Pôr alguém de volta na lista (ou tirá-lo à mão) -----------------------
create or replace function public.formando_saida(p_token uuid, p_id uuid, p_saiu boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  update formandos set saiu_em = case when p_saiu then coalesce(saiu_em, now()) else null end,
                       atualizado_em = now()
   where id = p_id;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

-- O endereço da zona de testes. Num sítio só: mudá-lo é mudar aqui.
create or replace function public._campanha_email_teste()
returns text language sql immutable as $$ select 'luiz.vale@gmail.com'::text $$;

-- Quem recebe ------------------------------------------------------------
--   filtro: {"tipo":"todos"} | {"tipo":"teste"} | {"tipo":"curso","curso":"..."}
--         | {"tipo":"turma","formacao_id":"..."} | {"tipo":"entidade","entidade":"..."}
--   Quem saiu da lista NUNCA entra, seja qual for o filtro.
create or replace function public._campanha_alvo(p_filtro jsonb)
returns table(id uuid, nome text, email text, saiu boolean)
language sql stable security definer set search_path = public as $$
  select f.id, f.nome, f.email, f.saiu_em is not null
    from formandos f
   where coalesce(p_filtro->>'tipo', 'todos') = 'todos'
      or exists (
        select 1 from formando_formacoes ff join formacoes c on c.id = ff.formacao_id
         where ff.formando_id = f.id
           and case p_filtro->>'tipo'
                 when 'curso'    then lower(c.curso) = lower(p_filtro->>'curso')
                 when 'entidade' then lower(c.entidade) = lower(p_filtro->>'entidade')
                 when 'turma'    then c.id::text = p_filtro->>'formacao_id'
                 else false end)
$$;
revoke all on function public._campanha_alvo(jsonb) from public, anon, authenticated;

create or replace function public.campanha_destinatarios(p_token uuid, p_filtro jsonb)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  if p_filtro->>'tipo' = 'teste' then
    return json_build_object('n', 1, 'sairam', 0, 'teste', _campanha_email_teste());
  end if;
  return (select json_build_object('n', count(*) filter (where not saiu),
                                   'sairam', count(*) filter (where saiu))
            from _campanha_alvo(p_filtro));
end $$;

-- As campanhas -----------------------------------------------------------
create or replace function public.campanhas_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return coalesce((
    select json_agg(json_build_object(
             'id', c.id, 'assunto', c.assunto, 'estado', c.estado, 'filtro', c.filtro,
             'criada_em', c.criada_em, 'atualizada_em', c.atualizada_em, 'enviada_em', c.enviada_em,
             'n',         (select count(*) from campanha_envios e where e.campanha_id = c.id),
             'enviados',  (select count(*) from campanha_envios e where e.campanha_id = c.id and e.estado = 'enviado'),
             'erros',     (select count(*) from campanha_envios e where e.campanha_id = c.id and e.estado = 'erro'),
             'clicaram',  (select count(*) from campanha_envios e where e.campanha_id = c.id and e.cliques > 0),
             'sairam',    (select count(*) from campanha_envios e where e.campanha_id = c.id and e.saiu_em is not null))
           order by c.atualizada_em desc)
      from campanhas c), '[]'::json);
end $$;

create or replace function public.campanha_ler(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.campanhas;
begin
  perform _repo_root(p_token);
  select * into c from campanhas where id = p_id;
  if c.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object(
    'id', c.id, 'assunto', c.assunto, 'corpo', c.corpo, 'botao_texto', c.botao_texto,
    'botao_link', c.botao_link, 'filtro', c.filtro, 'estado', c.estado,
    'criada_em', c.criada_em, 'enviada_em', c.enviada_em,
    'envios', coalesce((
      select json_agg(json_build_object(
               'nome', e.nome, 'email', e.email, 'estado', e.estado, 'enviado_em', e.enviado_em,
               'erro', e.erro, 'cliques', e.cliques, 'primeiro_clique', e.primeiro_clique,
               'saiu_em', e.saiu_em)
             order by lower(e.nome), lower(e.email))
        from campanha_envios e where e.campanha_id = c.id), '[]'::json));
end $$;

-- Gravar o rascunho. Uma campanha preparada mas ainda sem nada enviado
-- volta a rascunho (os envios preparados apagam-se); com algum enviado,
-- já não se mexe - o que foi enviado tem de ficar como estava.
create or replace function public.campanha_gravar(p_token uuid, p_id uuid, p_dados jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid := p_id; v_estado text;
begin
  perform _repo_root(p_token);
  if v_id is null then
    insert into campanhas default values returning id into v_id;
  else
    select estado into v_estado from campanhas where id = v_id;
    if v_estado is null then raise exception 'NAO_ENCONTRADO'; end if;
    if exists (select 1 from campanha_envios where campanha_id = v_id and estado <> 'por_enviar') then
      raise exception 'JA_ENVIADA';
    end if;
    delete from campanha_envios where campanha_id = v_id;
  end if;
  update campanhas set
      assunto     = btrim(coalesce(p_dados->>'assunto', '')),
      corpo       = coalesce(p_dados->>'corpo', ''),
      botao_texto = btrim(coalesce(p_dados->>'botao_texto', '')),
      botao_link  = btrim(coalesce(p_dados->>'botao_link', '')),
      filtro      = coalesce(p_dados->'filtro', '{"tipo":"todos"}'::jsonb),
      estado = 'rascunho', atualizada_em = now()
    where id = v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.campanha_apagar(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  delete from campanhas where id = p_id;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

-- Preparar: fixa os destinatários e devolve um envio por pessoa, com o
-- seu token. É isto que o Repo põe no ficheiro que o programa do PC lê.
-- Chamar outra vez numa campanha já preparada devolve o que falta
-- enviar - é assim que se retoma um envio interrompido.
create or replace function public.campanha_preparar(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.campanhas;
begin
  perform _repo_root(p_token);
  select * into c from campanhas where id = p_id;
  if c.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  if c.assunto = '' or c.corpo = '' then raise exception 'DADOS_EM_FALTA'; end if;
  if c.estado = 'rascunho' then
    if c.filtro->>'tipo' = 'teste' then
      insert into campanha_envios(campanha_id, formando_id, email, nome)
        values (c.id, null, _campanha_email_teste(), 'Diogo');
    else
      insert into campanha_envios(campanha_id, formando_id, email, nome)
        select c.id, a.id, a.email, a.nome from _campanha_alvo(c.filtro) a where not a.saiu
      on conflict do nothing;
    end if;
    if not exists (select 1 from campanha_envios where campanha_id = c.id) then
      raise exception 'SEM_DESTINATARIOS';
    end if;
    update campanhas set estado = 'preparada', atualizada_em = now() where id = c.id;
  end if;
  return json_build_object(
    'id', c.id, 'assunto', c.assunto,
    'envios', coalesce((
      select json_agg(json_build_object('email', e.email, 'nome', e.nome, 'token', e.token)
             order by lower(e.nome), lower(e.email))
        from campanha_envios e where e.campanha_id = c.id and e.estado <> 'enviado'), '[]'::json));
end $$;

-- ---------- O que é público: chega só com o token de cada pessoa ----------

-- O programa do PC diz o que enviou. Quando já não falta ninguém, a
-- campanha passa a enviada.
create or replace function public.campanha_envio_marcar(p_token uuid, p_ok boolean, p_erro text default '')
returns json language plpgsql security definer set search_path = public as $$
declare v_camp uuid;
begin
  update campanha_envios
     set estado = case when p_ok then 'enviado' else 'erro' end,
         enviado_em = case when p_ok then now() else enviado_em end,
         erro = case when p_ok then '' else left(coalesce(p_erro, ''), 300) end
   where token = p_token and estado <> 'enviado'
  returning campanha_id into v_camp;
  if v_camp is null then return json_build_object('ok', false); end if;
  if not exists (select 1 from campanha_envios where campanha_id = v_camp and estado = 'por_enviar') then
    update campanhas set estado = 'enviada', enviada_em = coalesce(enviada_em, now()) where id = v_camp;
  end if;
  return json_build_object('ok', true);
end $$;

-- Clicou em Inscrever: conta e devolve para onde ir.
create or replace function public.campanha_clique(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_link text;
begin
  update campanha_envios e set cliques = cliques + 1, primeiro_clique = coalesce(primeiro_clique, now())
   where e.token = p_token;
  select c.botao_link into v_link
    from campanha_envios e join campanhas c on c.id = e.campanha_id where e.token = p_token;
  return json_build_object('link', v_link);
end $$;

-- A página de sair da lista mostra a quem se refere antes de confirmar.
create or replace function public.campanha_sair_ver(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_email text; v_saiu boolean;
begin
  select e.email, f.saiu_em is not null into v_email, v_saiu
    from campanha_envios e left join formandos f on f.id = e.formando_id where e.token = p_token;
  if v_email is null then return json_build_object('ok', false); end if;
  return json_build_object('ok', true, 'email', v_email, 'ja_saiu', coalesce(v_saiu, false));
end $$;

create or replace function public.campanha_sair(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_formando uuid;
begin
  update campanha_envios set saiu_em = coalesce(saiu_em, now())
   where token = p_token returning formando_id into v_formando;
  if not found then return json_build_object('ok', false); end if;
  update formandos set saiu_em = coalesce(saiu_em, now()) where id = v_formando;
  return json_build_object('ok', true);
end $$;

-- ---------- Permissões ----------
revoke all on function public.formandos_listar(uuid) from public, anon;
revoke all on function public.formando_saida(uuid, uuid, boolean) from public, anon;
revoke all on function public.campanha_destinatarios(uuid, jsonb) from public, anon;
revoke all on function public.campanhas_listar(uuid) from public, anon;
revoke all on function public.campanha_ler(uuid, uuid) from public, anon;
revoke all on function public.campanha_gravar(uuid, uuid, jsonb) from public, anon;
revoke all on function public.campanha_apagar(uuid, uuid) from public, anon;
revoke all on function public.campanha_preparar(uuid, uuid) from public, anon;
revoke all on function public.campanha_envio_marcar(uuid, boolean, text) from public, anon;
revoke all on function public.campanha_clique(uuid) from public, anon;
revoke all on function public.campanha_sair_ver(uuid) from public, anon;
revoke all on function public.campanha_sair(uuid) from public, anon;

grant execute on function public.formandos_listar(uuid) to anon, authenticated;
grant execute on function public.formando_saida(uuid, uuid, boolean) to anon, authenticated;
grant execute on function public.campanha_destinatarios(uuid, jsonb) to anon, authenticated;
grant execute on function public.campanhas_listar(uuid) to anon, authenticated;
grant execute on function public.campanha_ler(uuid, uuid) to anon, authenticated;
grant execute on function public.campanha_gravar(uuid, uuid, jsonb) to anon, authenticated;
grant execute on function public.campanha_apagar(uuid, uuid) to anon, authenticated;
grant execute on function public.campanha_preparar(uuid, uuid) to anon, authenticated;
grant execute on function public.campanha_envio_marcar(uuid, boolean, text) to anon, authenticated;
grant execute on function public.campanha_clique(uuid) to anon, authenticated;
grant execute on function public.campanha_sair_ver(uuid) to anon, authenticated;
grant execute on function public.campanha_sair(uuid) to anon, authenticated;
