-- =====================================================================
--  CRM - CAMPANHAS: O CONSTRUTOR DE EMAIL
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase, DEPOIS do 12-campanhas.sql.
--  É idempotente.
--
--  1. O EMAIL PASSA A SER UMA ESTRUTURA (`conteudo`): texto de
--     pré-visualização, cabeçalho, abertura, VÁRIAS formações (cada uma
--     com o seu botão e o seu link de inscrição), fecho, LinkedIn e
--     rodapé com a frase de sair. O Repo desenha-o com o MJML. As
--     colunas antigas (corpo, botao_texto, botao_link) ficam, para as
--     campanhas que já existiam.
--
--  2. CADA CLIQUE SABE EM QUE FORMAÇÃO FOI. O link de cada botão leva o
--     número dele (/i/?t=TOKEN&b=0, b=1...). `cliques_botoes` conta-os
--     por pessoa: {"0":2,"1":1} - e assim sabe-se quem se interessou
--     por qual formação, e não só que clicou.
-- =====================================================================

alter table public.campanhas       add column if not exists conteudo jsonb;
alter table public.campanha_envios add column if not exists cliques_botoes jsonb not null default '{}'::jsonb;

-- Ler a campanha, agora com o conteúdo e os cliques por formação --------
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
               'primeiro_clique', e.primeiro_clique, 'saiu_em', e.saiu_em)
             order by lower(e.nome), lower(e.email))
        from campanha_envios e where e.campanha_id = c.id), '[]'::json));
end $$;

-- Gravar, agora com o conteúdo ------------------------------------------
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
      conteudo    = p_dados->'conteudo',
      filtro      = coalesce(p_dados->'filtro', '{"tipo":"todos"}'::jsonb),
      estado = 'rascunho', atualizada_em = now()
    where id = v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

-- Preparar: aceita uma campanha só com conteúdo (sem o corpo antigo) ------
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

-- O clique, agora com o número do botão ------------------------------------
--   Sem botão (emails antigos, de um botão só) usa-se o botao_link antigo.
drop function if exists public.campanha_clique(uuid);
create or replace function public.campanha_clique(p_token uuid, p_botao int default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_link text; v_k text := coalesce(p_botao::text, '0');
begin
  update campanha_envios e
     set cliques = cliques + 1,
         primeiro_clique = coalesce(primeiro_clique, now()),
         cliques_botoes = jsonb_set(cliques_botoes, array[v_k], to_jsonb(coalesce((cliques_botoes->>v_k)::int, 0) + 1))
   where e.token = p_token;
  select case
           when p_botao is not null and c.conteudo is not null
             then c.conteudo->'formacoes'->p_botao->>'link'
           else nullif(c.botao_link, '')
         end
    into v_link
    from campanha_envios e join campanhas c on c.id = e.campanha_id where e.token = p_token;
  return json_build_object('link', v_link);
end $$;

revoke all on function public.campanha_clique(uuid, int) from public, anon;
grant execute on function public.campanha_clique(uuid, int) to anon, authenticated;
