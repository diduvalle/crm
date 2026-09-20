-- =====================================================================
--  CRM - APAGAR A SÉRIO: turmas e escolas
-- =====================================================================
--  SUBSTITUI o comportamento do 04-espaco-apagar.sql. Aquele soltava as
--  turmas para "Sem escola" e deixava-as lá; a montar a plataforma isso
--  só empurra o lixo de sítio. Aqui apaga-se mesmo, e apaga-se tudo o
--  que está dentro.
--
--  ISTO NÃO SE DESFAZ. Quem chama é o root, e o Repo ainda pede um
--  código de 4 dígitos antes - a rede de segurança está no cliente, de
--  propósito: aqui em baixo não há como distinguir um engano de uma
--  vontade.
--
--  A cascata já existe no esquema e vem de 2026: todas as chaves para
--  `turmas(id)` são `on delete cascade`, por isso apagar uma turma leva
--  atrás utilizadores, submissoes, rascunhos, sessoes, repo_turmas,
--  repo_sessoes, repo_acessos, repo_modulos, repo_publicacoes e
--  repo_envios. NÃO É PRECISO apagar nada disso à mão - e não se deve,
--  para não haver duas verdades sobre a ordem.
--
--  A única tabela que ficaria órfã é `propostas_publicas`: não tem
--  chave estrangeira (guarda só o número da turma em texto), por isso é
--  apagada aqui explicitamente, pelo código da turma.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- O motor, sem autenticação: só lhe chamam as duas funções públicas
-- abaixo, que verificam o root primeiro. Conta antes de apagar, para
-- poder dizer o que levou.
-- ---------------------------------------------------------------------
create or replace function public._apagar_turma(p_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare v_cod text; v_nome text; v_form int; v_sess int; v_ent int; v_prop int;
begin
  select codigo, coalesce(nome,'') into v_cod, v_nome from turmas where id = p_id;
  if v_cod is null then return null; end if;

  select count(*) into v_form from utilizadores  where turma_id = p_id;
  select count(*) into v_ent  from submissoes    where turma_id = p_id;
  select count(*) into v_sess from repo_sessoes  where turma_id = p_id;

  -- a única sem chave estrangeira (o campo `turma` é o código, em texto)
  delete from propostas_publicas where lower(turma) = lower(v_cod);
  get diagnostics v_prop = row_count;

  delete from turmas where id = p_id;   -- e o cascade faz o resto

  return json_build_object('codigo', v_cod, 'nome', v_nome, 'formandos', v_form,
                           'sessoes', v_sess, 'entregas', v_ent, 'propostas', v_prop);
end $$;
revoke all on function public._apagar_turma(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Apagar UMA turma. Pelo código, que é único e é o que o Repo tem à mão
-- (o `id` que a lista devolve é o da linha em repo_turmas, não o da turma).
-- ---------------------------------------------------------------------
drop function if exists public.turma_apagar(uuid, text);
create or replace function public.turma_apagar(p_token uuid, p_codigo text)
returns json
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v json;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;
  select id into v_id from turmas where lower(codigo) = lower(trim(p_codigo));
  if v_id is null then raise exception 'TURMA_NAO_EXISTE'; end if;
  v := _apagar_turma(v_id);
  return v;
end $$;
revoke all on function public.turma_apagar(uuid, text) from public, anon;
grant execute on function public.turma_apagar(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Apagar uma ESCOLA: as turmas dela vão atrás, uma a uma pelo mesmo
-- motor, e depois a linha da escola.
-- ---------------------------------------------------------------------
drop function if exists public.espaco_apagar(uuid, uuid);
create or replace function public.espaco_apagar(p_token uuid, p_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare v_nome text; v_slug text; r record; v json;
        n_t int := 0; n_f int := 0; n_s int := 0; n_e int := 0; n_p int := 0;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;
  select nome, slug into v_nome, v_slug from espacos where id = p_id;
  if v_nome is null then raise exception 'NAO_EXISTE'; end if;

  for r in select id from turmas where espaco_id = p_id loop
    v := _apagar_turma(r.id);
    n_t := n_t + 1;
    n_f := n_f + (v->>'formandos')::int;
    n_s := n_s + (v->>'sessoes')::int;
    n_e := n_e + (v->>'entregas')::int;
    n_p := n_p + (v->>'propostas')::int;
  end loop;

  delete from espacos where id = p_id;

  return json_build_object('ok', true, 'nome', v_nome, 'slug', v_slug,
                           'turmas', n_t, 'formandos', n_f, 'sessoes', n_s,
                           'entregas', n_e, 'propostas', n_p);
end $$;
revoke all on function public.espaco_apagar(uuid, uuid) from public, anon;
grant execute on function public.espaco_apagar(uuid, uuid) to anon, authenticated;

-- O PostgREST guarda o esquema em cache; sem isto as funções novas só
-- aparecem daqui a uns minutos.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select count(*) from public.turmas;
--   select count(*) from public.utilizadores;
--   (depois de apagar uma escola de teste, os dois descem; nada fica
--    para trás em "Sem escola")
