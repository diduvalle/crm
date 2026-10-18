-- =====================================================================
--  CRM - CAMPANHAS: EMAILS DEVOLVIDOS
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase, DEPOIS do 13. É idempotente.
--
--  Quando um endereço já não existe, o Microsoft 365 devolve um aviso
--  ("Não é possível entregar") à caixa do Turismo de Portugal. O
--  programa do PC (enviar-campanha.ps1, opção 4 do menu) lê esses avisos,
--  reconhece de quem eram, e marca-os aqui:
--
--    - no envio da campanha (devolvido_em, devolvido_motivo);
--    - na pessoa (formandos.devolvido_em): as campanhas seguintes já não
--      lhe enviam, até o email ser corrigido.
--
--  Corrigir o email na ficha tira a marca sozinho (um trigger). Também se
--  pode tirar à mão, se o aviso tiver sido um engano (caixa cheia, etc.).
-- =====================================================================

alter table public.formandos       add column if not exists devolvido_em     timestamptz;
alter table public.formandos       add column if not exists devolvido_motivo text not null default '';
alter table public.campanha_envios add column if not exists devolvido_em     timestamptz;
alter table public.campanha_envios add column if not exists devolvido_motivo text not null default '';

-- Email corrigido = marca tirada ------------------------------------------
create or replace function public._formando_email_mudou()
returns trigger language plpgsql as $$
begin
  if new.email is distinct from old.email then
    new.devolvido_em := null;
    new.devolvido_motivo := '';
  end if;
  return new;
end $$;
drop trigger if exists formando_email_mudou on public.formandos;
create trigger formando_email_mudou before update on public.formandos
  for each row execute function public._formando_email_mudou();

-- A lista dos formandos, agora com quem tem o email devolvido -------------
create or replace function public.formandos_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return json_build_object(
    'formandos', coalesce((
      select json_agg(json_build_object(
               'id', f.id, 'nome', f.nome, 'apelido', f.apelido, 'email', f.email,
               'notas', f.notas, 'criado_em', f.criado_em, 'saiu_em', f.saiu_em,
               'devolvido_em', f.devolvido_em, 'devolvido_motivo', f.devolvido_motivo,
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

-- Tirar a marca à mão (ou pô-la) -----------------------------------------
create or replace function public.formando_devolvido(p_token uuid, p_id uuid, p_devolvido boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  update formandos set devolvido_em = case when p_devolvido then coalesce(devolvido_em, now()) else null end,
                       devolvido_motivo = case when p_devolvido then devolvido_motivo else '' end,
                       atualizado_em = now()
   where id = p_id;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

-- Quem recebe: quem saiu da lista e quem tem o email devolvido ficam de fora
drop function if exists public._campanha_alvo(jsonb);
create function public._campanha_alvo(p_filtro jsonb)
returns table(id uuid, nome text, email text, saiu boolean, devolvido boolean)
language sql stable security definer set search_path = public as $$
  select f.id, f.nome, f.email, f.saiu_em is not null, f.devolvido_em is not null
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
    return json_build_object('n', 1, 'sairam', 0, 'devolvidos', 0, 'teste', _campanha_email_teste());
  end if;
  return (select json_build_object('n',          count(*) filter (where not saiu and not devolvido),
                                   'sairam',     count(*) filter (where saiu),
                                   'devolvidos', count(*) filter (where devolvido and not saiu))
            from _campanha_alvo(p_filtro));
end $$;

-- Preparar (a do 13), agora também sem os devolvidos ----------------------
create or replace function public.campanha_preparar(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.campanhas;
begin
  perform _repo_root(p_token);
  select * into c from campanhas where id = p_id;
  if c.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  if c.assunto = '' or (c.corpo = '' and c.conteudo is null) then raise exception 'DADOS_EM_FALTA'; end if;
  if c.estado = 'rascunho' then
    if c.filtro->>'tipo' = 'teste' then
      insert into campanha_envios(campanha_id, formando_id, email, nome)
        values (c.id, null, _campanha_email_teste(), 'Diogo');
    else
      insert into campanha_envios(campanha_id, formando_id, email, nome)
        select c.id, a.id, a.email, a.nome from _campanha_alvo(c.filtro) a where not a.saiu and not a.devolvido
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

-- Ler a campanha (a do 13), agora com as devoluções -----------------------
create or replace function public.campanha_ler(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.campanhas;
begin
  perform _repo_root(p_token);
  select * into c from campanhas where id = p_id;
  if c.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object(
    'id', c.id, 'assunto', c.assunto, 'corpo', c.corpo, 'botao_texto', c.botao_texto,
    'botao_link', c.botao_link, 'conteudo', c.conteudo, 'filtro', c.filtro, 'estado', c.estado,
    'criada_em', c.criada_em, 'enviada_em', c.enviada_em,
    'envios', coalesce((
      select json_agg(json_build_object(
               'nome', e.nome, 'email', e.email, 'estado', e.estado, 'enviado_em', e.enviado_em,
               'erro', e.erro, 'cliques', e.cliques, 'cliques_botoes', e.cliques_botoes,
               'primeiro_clique', e.primeiro_clique, 'saiu_em', e.saiu_em,
               'devolvido_em', e.devolvido_em, 'devolvido_motivo', e.devolvido_motivo)
             order by lower(e.nome), lower(e.email))
        from campanha_envios e where e.campanha_id = c.id), '[]'::json));
end $$;

-- A lista das campanhas (a do 12), agora com quantos foram devolvidos -----
create or replace function public.campanhas_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return coalesce((
    select json_agg(json_build_object(
             'id', c.id, 'assunto', c.assunto, 'estado', c.estado, 'filtro', c.filtro,
             'criada_em', c.criada_em, 'atualizada_em', c.atualizada_em, 'enviada_em', c.enviada_em,
             'n',          (select count(*) from campanha_envios e where e.campanha_id = c.id),
             'enviados',   (select count(*) from campanha_envios e where e.campanha_id = c.id and e.estado = 'enviado'),
             'erros',      (select count(*) from campanha_envios e where e.campanha_id = c.id and e.estado = 'erro'),
             'clicaram',   (select count(*) from campanha_envios e where e.campanha_id = c.id and e.cliques > 0),
             'sairam',     (select count(*) from campanha_envios e where e.campanha_id = c.id and e.saiu_em is not null),
             'devolvidos', (select count(*) from campanha_envios e where e.campanha_id = c.id and e.devolvido_em is not null))
           order by c.atualizada_em desc)
      from campanhas c), '[]'::json);
end $$;

-- A devolução, vinda do programa do PC ------------------------------------
--   Pública como o clique e o sair: quem a chama precisa do código
--   pessoal do email devolvido, e o pior que pode fazer é marcar-se a si
--   próprio. Numa campanha de teste (sem formando) só marca o envio.
create or replace function public.campanha_devolvido(p_token uuid, p_motivo text default '')
returns json language plpgsql security definer set search_path = public as $$
declare v_formando uuid; v_motivo text := left(btrim(coalesce(p_motivo, '')), 300);
begin
  update campanha_envios
     set devolvido_em = coalesce(devolvido_em, now()), devolvido_motivo = v_motivo
   where token = p_token
  returning formando_id into v_formando;
  if not found then return json_build_object('ok', false); end if;
  update formandos set devolvido_em = coalesce(devolvido_em, now()), devolvido_motivo = v_motivo
   where id = v_formando;
  return json_build_object('ok', true);
end $$;

revoke all on function public.formando_devolvido(uuid, uuid, boolean) from public, anon;
revoke all on function public.campanha_devolvido(uuid, text) from public, anon;
grant execute on function public.formandos_listar(uuid) to anon, authenticated;
grant execute on function public.formando_devolvido(uuid, uuid, boolean) to anon, authenticated;
grant execute on function public.campanha_destinatarios(uuid, jsonb) to anon, authenticated;
grant execute on function public.campanha_preparar(uuid, uuid) to anon, authenticated;
grant execute on function public.campanha_ler(uuid, uuid) to anon, authenticated;
grant execute on function public.campanhas_listar(uuid) to anon, authenticated;
grant execute on function public.campanha_devolvido(uuid, text) to anon, authenticated;
