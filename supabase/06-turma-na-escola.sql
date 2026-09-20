-- =====================================================================
--  CRM - A TURMA SÓ ABRE NO ENDEREÇO DA ESCOLA DELA
-- =====================================================================
--  O problema: o `login` procura a turma só pelo código. O slug do
--  endereço (crm.cr0x.org/<escola>) servia apenas para vestir a marca e
--  não entrava na autenticação, por isso o número de uma turma do IEFP
--  entrava em /tp - com o logótipo do Turismo de Portugal por cima.
--
--  ESTRITAMENTE ADITIVO. O `login` de 3 argumentos NÃO é tocado: é a
--  porta do iefpcrm.cr0x.org, que está congelado. Em vez de o substituir
--  (drop + create deixaria a produção sem porta durante um instante, e
--  uma versão nova podia perder campos), cria-se uma função ao lado que
--  faz a verificação e DELEGA nele. Uma linha de diferença, zero risco
--  para o que já lá está.
--
--  Nota honesta sobre o alcance: isto impede a confusão, não é uma
--  fronteira de segurança nova. Quem abrir a consola do browser ainda
--  pode chamar o `login` de 3 argumentos - mas para isso precisa de
--  credenciais válidas DESSA turma, e com elas entrava na mesma pelo
--  endereço certo. O que muda é que já não se entra por engano.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Entrar numa turma, mas só a partir da escola dela
-- ---------------------------------------------------------------------
-- p_espaco vazio = sem verificação (é o que a app antiga faz ao chamar
-- o `login` direto). Uma turma SEM escola é recusada quando se exige
-- uma: no crm.cr0x.org a app é sempre servida dentro de uma escola.
--
-- Passa ao `login` o código TAL COMO ESTÁ GUARDADO: quem receber "T15"
-- num papel e escrever "t15" entra na mesma, que era a intenção do
-- 02-codigo-turma.sql mas ficou a meio (o `login` compara exato).
create or replace function public.login_espaco(
  p_codigo text, p_username text, p_password text, p_espaco text
) returns json
language plpgsql security definer set search_path = public as $$
declare v_cod text; v_esp uuid; v_slug text;
begin
  select t.codigo, t.espaco_id into v_cod, v_esp
    from turmas t where lower(t.codigo) = lower(trim(p_codigo));
  if v_cod is null then raise exception 'TURMA_NAO_EXISTE'; end if;

  if coalesce(trim(p_espaco),'') <> '' then
    select e.slug into v_slug from espacos e where e.id = v_esp;
    if v_slug is null or lower(v_slug) <> lower(trim(p_espaco)) then
      raise exception 'TURMA_NOUTRA_ESCOLA';
    end if;
  end if;

  return public.login(v_cod, p_username, p_password);
end $$;
revoke all on function public.login_espaco(text, text, text, text) from public, anon;
grant execute on function public.login_espaco(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- O mesmo para a verificação que acontece ANTES do ecrã da password
-- ---------------------------------------------------------------------
-- Sobrecarga, não substituição: com {p_codigo} responde a de sempre,
-- com {p_codigo, p_espaco} responde esta. Sem valor por omissão, para
-- as duas nunca ficarem ambíguas.
create or replace function public.turma_existe(p_codigo text, p_espaco text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.turmas t
      left join public.espacos e on e.id = t.espaco_id
     where lower(t.codigo) = lower(trim(p_codigo))
       and ( coalesce(trim(p_espaco),'') = ''
             or lower(coalesce(e.slug,'')) = lower(trim(p_espaco)) )
  );
$$;
revoke all on function public.turma_existe(text, text) from public, anon;
grant execute on function public.turma_existe(text, text) to anon, authenticated;

-- O PostgREST guarda o esquema em cache; sem isto as funções novas só
-- aparecem daqui a uns minutos.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select public.turma_existe('12023483');            -> true
--   select public.turma_existe('12023483','iefp');     -> true
--   select public.turma_existe('12023483','tp');       -> false
--   select public.login_espaco('12023483','x','x','tp');  -> TURMA_NOUTRA_ESCOLA
--   (e o `login` de sempre continua lá, intacto, para o iefpcrm)
