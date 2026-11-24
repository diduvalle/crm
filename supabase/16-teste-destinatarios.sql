-- =====================================================================
--  CRM - OS DESTINATÁRIOS DE UMA AVALIAÇÃO DEIXAM DE FICAR PRESOS
-- =====================================================================
--  A lista de quem recebe o teste era escrita UMA vez, no momento de
--  aplicar. Quem nessa altura ainda não tinha email ficava de fora para
--  sempre: aparecia na pauta como "sem email" e nunca mais havia como
--  lhe enviar o link. E um email corrigido depois de aplicar não
--  chegava à linha de envio.
--
--  Passa a haver uma sincronização, chamada sempre que se abre o ecrã
--  da avaliação - a mesma ideia que os badges já usavam:
--
--    1. acrescenta quem tem email e ainda não tinha linha
--    2. atualiza o email de quem AINDA NÃO recebeu o convite
--    3. dá o link pessoal a quem acabou de entrar
--
--  Nunca toca em quem já recebeu: o link que saiu continua a ser o
--  mesmo, e as aberturas e respostas ficam onde estão.
--
--  O email pessoal (email2) manda sempre; o institucional é o recurso.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

create or replace function public.teste_sincronizar(p_token uuid, p_aplicacao_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare a public.teste_aplicacoes; v_novos int := 0; v_act int := 0; v_links int := 0;
begin
  perform _repo_root(p_token);
  select * into a from teste_aplicacoes where id = p_aplicacao_id;
  if a.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  if a.sessao_id is null then return json_build_object('ok', false, 'erro', 'SEM_SESSAO'); end if;

  -- 1) quem entrou depois, ou quem só agora tem email
  insert into repo_acessos(sessao_id, user_id, email, email2)
    select a.sessao_id, u.id,
           coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),'')), null
      from utilizadores u
     where u.turma_id = a.turma_id and u.papel = 'Formando'
       and coalesce(nullif(trim(u.email),''), nullif(trim(u.email2),'')) is not null
       and not exists (select 1 from repo_acessos x
                        where x.sessao_id = a.sessao_id and x.user_id = u.id);
  get diagnostics v_novos = row_count;

  -- 2) o email mudou antes de o convite sair
  update repo_acessos x
     set email = coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),''))
    from utilizadores u
   where u.id = x.user_id
     and x.sessao_id = a.sessao_id
     and x.enviado_em is null
     and coalesce(nullif(trim(u.email),''), nullif(trim(u.email2),'')) is not null
     and coalesce(x.email,'') is distinct from
         coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),''));
  get diagnostics v_act = row_count;

  -- 3) o link pessoal de quem acabou de entrar
  update repo_acessos set destino = 'https://crm.cr0x.org/t/?t=' || token
   where sessao_id = a.sessao_id and coalesce(destino,'') = '';
  get diagnostics v_links = row_count;

  return json_build_object('ok', true, 'novos', v_novos,
                           'atualizados', v_act, 'links', v_links);
end $$;

revoke all on function public.teste_sincronizar(uuid, uuid) from public, anon;
grant execute on function public.teste_sincronizar(uuid, uuid) to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir, depois de abrir o ecrã da avaliação:
-- ---------------------------------------------------------------------
--   select u.nome, u.apelido, a.email, a.enviado_em
--     from repo_acessos a
--     join utilizadores u on u.id = a.user_id
--     join repo_sessoes s on s.id = a.sessao_id
--    where s.tipo = 'teste'
--    order by u.nome;
