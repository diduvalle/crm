-- =====================================================================
--  CRM - O TEXTO DO EMAIL DO BADGE
-- =====================================================================
--  O email que sai de raiz trazia a mensagem toda numa linha so, e o
--  rodape tambem. Lido no telemovel era um bloco. O email que a turma
--  anterior recebeu estava escrito em linhas curtas, com uma despedida -
--  e le-se muito melhor.
--
--  Aqui passa-se esse texto a ser o de raiz, para nao ser preciso
--  reescreve-lo turma a turma. O corpo e o rodape ja respeitam as
--  quebras de linha (a Edge Function transforma-as em <br>), por isso
--  basta o texto vir escrito como deve ser lido.
--
--  NAO TOCA em turmas onde o texto ja foi mudado a mao: a atualizacao
--  la em baixo so apanha quem ainda tem, letra por letra, o texto
--  antigo de raiz.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) O que passa a nascer com cada turma
--    (identica a que ja existe; muda so o texto e o rodape)
-- ---------------------------------------------------------------------
create or replace function public.repo_selos_preparar(p_token uuid, p_repo_turma_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare rt public.repo_turmas; v_sess uuid; v_novos int; s public.repo_sessoes;
begin
  perform _repo_root(p_token);
  select * into rt from repo_turmas where id = p_repo_turma_id;
  if rt.id is null then raise exception 'NAO_ENCONTRADO'; end if;

  select id into v_sess from repo_sessoes
   where repo_turma_id = rt.id and tipo = 'badge' limit 1;

  if v_sess is null then
    insert into repo_sessoes(repo_turma_id, turma_id, tipo, titulo, texto, link, modulo,
                             assunto, cabecalho, saudacao, botao, rodape)
      values (rt.id, rt.turma_id, 'badge',
              'O teu badge está pronto',
              E'Concluíste a formação prática em CRM.\nEste é o teu badge, com uma página própria onde qualquer pessoa pode confirmar a conclusão do teu trabalho.\n\nFoi um gosto ter-me cruzado contigo.\n\nAbraço.',
              'https://crm.cr0x.org/', '',
              'O teu badge - Formação prática em CRM',
              'Formação prática em CRM',
              'Olá {nome},',
              'Ver o meu badge',
              E'Este badge confirma a conclusão de um módulo da formação.\nNão é uma certificação profissional nem substitui o certificado da entidade formadora.')
      returning id into v_sess;
  end if;

  insert into repo_acessos(sessao_id, user_id, email, email2)
    select v_sess, u.id,
           coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),'')),
           null
      from utilizadores u
     where u.turma_id = rt.turma_id and u.papel = 'Formando'
       and coalesce(nullif(trim(u.email),''), nullif(trim(u.email2),'')) is not null
       and not exists (select 1 from repo_acessos a
                        where a.sessao_id = v_sess and a.user_id = u.id);
  get diagnostics v_novos = row_count;

  select * into s from repo_sessoes where id = v_sess;
  return json_build_object('ok', true, 'sessao_id', v_sess, 'novos', v_novos,
    'titulo', s.titulo, 'texto', s.texto, 'assunto', s.assunto,
    'cabecalho', s.cabecalho, 'saudacao', s.saudacao, 'botao', s.botao, 'rodape', s.rodape);
end $$;

-- ---------------------------------------------------------------------
-- 2) As turmas que ja nasceram com o texto corrido
--    So as que ainda o tem tal e qual - quem escreveu o seu fica com ele.
-- ---------------------------------------------------------------------
update public.repo_sessoes
   set texto = E'Concluíste a formação prática em CRM.\nEste é o teu badge, com uma página própria onde qualquer pessoa pode confirmar a conclusão do teu trabalho.\n\nFoi um gosto ter-me cruzado contigo.\n\nAbraço.'
 where tipo = 'badge'
   and coalesce(texto,'') not like E'%\n%'          -- quem ja escreveu o seu, escreveu em linhas
   and coalesce(texto,'') like 'Concluíste a formação prática em CRM.%';

update public.repo_sessoes
   set rodape = E'Este badge confirma a conclusão de um módulo da formação.\nNão é uma certificação profissional nem substitui o certificado da entidade formadora.'
 where tipo = 'badge'
   and coalesce(rodape,'') not like E'%\n%'
   and coalesce(rodape,'') like 'Este badge confirma a conclusão de um módulo%';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir: deve aparecer o texto ja partido em linhas
-- ---------------------------------------------------------------------
--   select titulo, texto, rodape from public.repo_sessoes where tipo = 'badge';
