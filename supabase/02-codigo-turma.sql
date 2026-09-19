-- =====================================================================
--  FASE 2.0 — PASSO 02: O CÓDIGO DA TURMA DEIXA DE SER 8 DÍGITOS
-- =====================================================================
--  Os 8 dígitos são a convenção do IEFP, não uma regra do mundo. Ficou
--  entranhada na restrição da tabela, na função que cria turmas e na
--  validação do ecrã de entrada. Uma escola nova pode numerar as turmas
--  como quiser: 2026-A, T15, outono.2, o que for.
--
--  RELAXAR, não mudar de forma: tudo o que era válido continua válido.
--  As turmas que existem são todas de 8 dígitos e nenhuma é tocada, e a
--  app antiga continua a criar 8 dígitos como sempre.
--
--  Idempotente. Supabase → SQL Editor → cola tudo → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- A restrição
-- ---------------------------------------------------------------------
-- Começa por letra ou número (para não haver códigos que começam por
-- hífen, que confundem quem os lê e quem os escreve num endereço), e
-- depois aceita letras, números, ponto, hífen e sublinhado. De 2 a 24
-- caracteres: um código de um só caracter é um acidente à espera de
-- acontecer, e 24 já é mais do que qualquer escola precisa.
alter table public.turmas drop constraint if exists turmas_codigo_check;
alter table public.turmas
  add constraint turmas_codigo_check
  check (codigo ~ '^[A-Za-z0-9][A-Za-z0-9._-]{1,23}$');

-- Os códigos deixam de ser só números, e portanto 'T15' e 't15' seriam
-- duas turmas diferentes - com o mesmo nome dito em voz alta. Passa a
-- haver um só, qualquer que seja a caixa em que foi escrito.
drop index if exists ux_turmas_codigo_lower;
create unique index ux_turmas_codigo_lower on public.turmas (lower(codigo));

-- ---------------------------------------------------------------------
-- A função que cria
-- ---------------------------------------------------------------------
-- Mesma assinatura, mesma lógica: só a validação do código é que muda,
-- mais a comparação sem distinguir maiúsculas na verificação de duplicado.
create or replace function public.criar_turma_em(
  p_token uuid, p_slug text, p_codigo text, p_nome_turma text,
  p_nome text, p_apelido text, p_email text,
  p_username text, p_password text
) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_espaco uuid; v_turma uuid; v_user uuid; v_sess uuid; v_recovery text; v_cod text;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;

  select id into v_espaco from espacos
   where slug = lower(trim(p_slug)) and not arquivado;
  if v_espaco is null then raise exception 'ESPACO_NAO_EXISTE'; end if;

  v_cod := trim(coalesce(p_codigo,''));
  if v_cod !~ '^[A-Za-z0-9][A-Za-z0-9._-]{1,23}$' then raise exception 'CODIGO_INVALIDO'; end if;
  if exists (select 1 from turmas where lower(codigo) = lower(v_cod)) then
    raise exception 'TURMA_JA_EXISTE';
  end if;
  if coalesce(trim(p_username),'') = '' or coalesce(p_password,'') = '' then
    raise exception 'DADOS_EM_FALTA';
  end if;

  insert into turmas(codigo, nome, criado_por, espaco_id)
    values (v_cod,
            coalesce(nullif(trim(p_nome_turma),''), 'Turma '||v_cod),
            lower(trim(coalesce(p_email,''))), v_espaco)
    returning id into v_turma;

  v_recovery := _novo_recovery_code();
  insert into utilizadores(turma_id, username, nome, apelido, email, papel,
                           pass_hash, recovery_hash)
    values (v_turma, lower(trim(p_username)), p_nome, coalesce(p_apelido,''),
            lower(trim(coalesce(p_email,''))), 'Administrador',
            extensions.crypt(p_password, extensions.gen_salt('bf')),
            extensions.crypt(v_recovery, extensions.gen_salt('bf')))
    returning id into v_user;

  insert into sessoes(user_id) values (v_user) returning token into v_sess;

  return json_build_object(
    'token', v_sess,
    'turma', json_build_object('codigo', v_cod),
    'espaco', lower(trim(p_slug)),
    'recovery', v_recovery,
    'user', json_build_object('id', v_user, 'username', lower(trim(p_username)),
            'nome', p_nome, 'apelido', coalesce(p_apelido,''), 'papel', 'Administrador'));
end $$;

-- ---------------------------------------------------------------------
-- Entrar sem distinguir maiúsculas
-- ---------------------------------------------------------------------
-- Quem receber "T15" num papel e escrever "t15" tem de entrar na mesma.
-- Estas três são as que recebem o código escrito por uma pessoa.
create or replace function public.turma_existe(p_codigo text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from turmas where lower(codigo) = lower(trim(p_codigo)));
$$;

create or replace function public.turma_espaco(p_codigo text)
returns json language sql security definer set search_path = public as $$
  select public.espaco_publico(e.slug)
  from public.turmas t join public.espacos e on e.id = t.espaco_id
  where lower(t.codigo) = lower(trim(p_codigo));
$$;

grant execute on function public.turma_existe(text) to anon, authenticated;
grant execute on function public.turma_espaco(text) to anon, authenticated;
grant execute on function public.criar_turma_em(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select codigo from public.turmas order by criado_em desc limit 5;
--     -> as de sempre, todas de 8 dígitos, intactas
--   select public.turma_existe('12023483');   -> true
