-- =====================================================================
--  CRM - REPOSITÓRIO: hierarquia Escolas -> Turmas -> Sessões
-- =====================================================================
--  O Repo passa a espelhar o modelo da plataforma (espaço ≠ turma):
--  primeiro escolhe-se a ESCOLA (espaço), depois vê-se as turmas dela -
--  todas as que existem no CRM, e as que ainda não estão no Repo podem
--  adicionar-se ali mesmo. Dentro da turma segue como antes (sessões).
--
--  "Sem escola": as turmas antigas ainda sem espaço (espaco_id nulo) não
--  podem desaparecer do Repo, por isso aparecem numa entrada própria.
--
--  Reusa: espacos, turmas.espaco_id, repo_turmas, repo_sessoes,
--  _repo_root, _repo_omissao (já existem). Não cria tabelas.
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Escolas (espaços) com contadores, para a lista do Repo. A última linha
-- é o "Sem escola", só quando há turmas órfãs.
-- ---------------------------------------------------------------------
drop function if exists public.repo_escolas(uuid);
create or replace function public.repo_escolas(p_token uuid)
returns table(id uuid, slug text, nome text, logo_url text, arquivado boolean,
              n_turmas bigint, n_geridas bigint)
language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return query
    select x.id, x.slug, x.nome, x.logo_url, x.arquivado, x.n_turmas, x.n_geridas
      from (
        select e.id, e.slug, e.nome, e.logo_url, e.arquivado,
               (select count(*) from turmas t where t.espaco_id = e.id) as n_turmas,
               (select count(*) from turmas t join repo_turmas rt on rt.turma_id = t.id
                 where t.espaco_id = e.id) as n_geridas
          from espacos e
        union all
        select null::uuid, ''::text, 'Sem escola'::text, ''::text, false,
               (select count(*) from turmas t where t.espaco_id is null),
               (select count(*) from turmas t join repo_turmas rt on rt.turma_id = t.id
                 where t.espaco_id is null)
         where exists (select 1 from turmas t where t.espaco_id is null)
      ) x
     order by (x.slug = ''), x.arquivado, x.nome;
end $$;

-- ---------------------------------------------------------------------
-- Turmas de uma escola: TODAS as do CRM. Quando já está no Repo, traz a
-- informação dele (mesma forma que repo_geridas) e gerida = true; quando
-- não está, id/drive vêm vazios e gerida = false (o ecrã mostra "Adicionar").
-- p_slug vazio = as turmas sem escola.
-- ---------------------------------------------------------------------
drop function if exists public.repo_turmas_da_escola(uuid, text);
create or replace function public.repo_turmas_da_escola(p_token uuid, p_slug text)
returns table(id uuid, codigo text, nome text, drive_url text,
              n_formandos bigint, n_sessoes bigint, ultimo_envio timestamptz,
              def_assunto text, def_cabecalho text, def_saudacao text, def_botao text, def_rodape text,
              modulos text, gerida boolean)
language plpgsql security definer set search_path = public as $$
declare v_espaco uuid; v_sem boolean;
begin
  perform _repo_root(p_token);
  v_sem := coalesce(trim(p_slug), '') = '';
  if not v_sem then
    select e.id into v_espaco from espacos e where e.slug = lower(trim(p_slug));
    if v_espaco is null then raise exception 'NAO_ENCONTRADO'; end if;
  end if;
  return query
    select rt.id, t.codigo, coalesce(t.nome, ''), coalesce(rt.drive_url, ''),
           (select count(*) from utilizadores u where u.turma_id = t.id and u.papel = 'Formando'),
           (select count(*) from repo_sessoes s where s.repo_turma_id = rt.id),
           (select max(s.enviado_em) from repo_sessoes s where s.repo_turma_id = rt.id),
           coalesce(rt.def_assunto,   _repo_omissao('assunto')),
           coalesce(rt.def_cabecalho, _repo_omissao('cabecalho')),
           coalesce(rt.def_saudacao,  _repo_omissao('saudacao')),
           coalesce(rt.def_botao,     _repo_omissao('botao')),
           coalesce(rt.def_rodape,    _repo_omissao('rodape')),
           coalesce(rt.modulos, ''),
           (rt.id is not null)
      from turmas t
      left join repo_turmas rt on rt.turma_id = t.id
     where (v_sem and t.espaco_id is null) or (not v_sem and t.espaco_id = v_espaco)
     order by (rt.id is null), t.codigo;
end $$;
