-- =====================================================================
--  CRM - APAGAR UMA ESCOLA (espaço)
-- =====================================================================
--  O 01-espacos.sql diz "arquiva-se, nunca se apaga", e continua certo
--  para uma escola a sério: os links dela andam por aí. Mas a montar a
--  plataforma criam-se escolas de teste, e essas só poluem a lista.
--
--  A regra desta função: a ESCOLA é o rótulo, não o conteúdo. Apagar o
--  rótulo NUNCA apaga turmas - as turmas dela ficam sem escola (é o
--  estado em que as antigas do IEFP já estão) e aparecem outra vez no
--  grupo "Sem escola" do Repo, com tudo lá dentro: formandos, sessões,
--  badges. Por isso isto é recuperável: cria-se a escola outra vez e
--  movem-se as turmas de volta.
--
--  O que se perde de verdade: a identidade (nome, logótipo, cor, dados
--  legais) e o endereço crm.cr0x.org/<slug>, que deixa de abrir.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

drop function if exists public.espaco_apagar(uuid, uuid);
create or replace function public.espaco_apagar(p_token uuid, p_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare v_nome text; v_slug text; v_turmas int;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;

  select nome, slug into v_nome, v_slug from espacos where id = p_id;
  if v_nome is null then raise exception 'NAO_EXISTE'; end if;

  -- soltar as turmas ANTES de apagar: a chave estrangeira não tem
  -- cascade de propósito, para nunca levar turmas atrás sem querer
  update turmas set espaco_id = null where espaco_id = p_id;
  get diagnostics v_turmas = row_count;

  delete from espacos where id = p_id;

  return json_build_object('ok', true, 'nome', v_nome, 'slug', v_slug,
                           'turmas', v_turmas);
end $$;

revoke all on function public.espaco_apagar(uuid, uuid) from public, anon;
grant execute on function public.espaco_apagar(uuid, uuid) to anon, authenticated;

-- O PostgREST guarda o esquema em cache; sem isto a função nova só
-- aparece daqui a uns minutos.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select count(*) from public.espacos;                  -> as de sempre
--   select count(*) from public.turmas where espaco_id is null;
--     (depois de apagar uma escola com turmas, este número sobe;
--      nenhuma turma é apagada, nunca)
