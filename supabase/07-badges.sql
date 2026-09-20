-- =====================================================================
--  CRM - BADGES EMITIDOS PELA PLATAFORMA
-- =====================================================================
--  Ate aqui um badge era uma pasta de ficheiros em b/<codigo>/, criada
--  por um script e publicada por um push. Funcionava, mas obrigava a
--  abrir o terminal a cada turma - e o script chegou a perder-se.
--
--  Agora o badge e uma LINHA nesta tabela, e a pagina b/ le-a pelo
--  codigo. Emitir passa a ser um clique no Repo.
--
--  AS 14 PAGINAS ANTIGAS NAO SAO TOCADAS: continuam a existir como
--  ficheiros em b/<codigo>/ e o alojamento serve-as antes de chegar a
--  pagina nova. Quem as tem guardadas nao da por nada.
--
--  O badge guarda o TEXTO ja resolvido (nome, escola, mes), nao
--  referencias. Um badge e um registo do que aconteceu: se a escola
--  mudar de nome daqui a um ano, o badge de quem acabou hoje continua a
--  dizer o que dizia. E por isso que nao ha joins na leitura.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

create table if not exists public.badges (
  codigo       text primary key,
  user_id      uuid not null references public.utilizadores(id) on delete cascade,
  nome         text not null,
  curso        text not null default 'Formação prática em CRM',
  formacao     text not null default 'Administração de CRM & RGPD',
  mes          text not null,                 -- "setembro de 2026"
  data_iso     date not null default current_date,
  contexto     text not null default '',      -- "Turma 12345678 · IEFP"
  formador     text not null default 'Diogo du Valle',
  formador_url text not null default 'https://www.linkedin.com/in/ldvale/',
  criado_em    timestamptz not null default now()
);
create unique index if not exists ix_badges_user on public.badges(user_id);
alter table public.badges enable row level security;

-- ---------------------------------------------------------------------
-- O codigo: 8 caracteres sem vogais nem 0/O/1/l. Estes codigos sao
-- ditos em voz alta e escritos a mao.
-- ---------------------------------------------------------------------
create or replace function public._badge_codigo()
returns text language plpgsql as $$
declare a text := 'BCDFGHJKMNPQRSTVWXYZbcdfghjkmnpqrstvwxyz23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..8 loop c := c || substr(a, floor(random()*length(a))::int + 1, 1); end loop;
    exit when not exists (select 1 from badges where codigo = c);
  end loop;
  return c;
end $$;
revoke all on function public._badge_codigo() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Ler um badge: PUBLICO. E o que a pagina b/ chama, sem ninguem ter
-- entrado. Devolve so o que ja esta impresso na propria pagina.
-- ---------------------------------------------------------------------
create or replace function public.badge_publico(p_codigo text)
returns json language sql security definer set search_path = public as $$
  select case when b.codigo is null then null else json_build_object(
    'codigo', b.codigo, 'nome', b.nome, 'curso', b.curso, 'formacao', b.formacao,
    'mes', b.mes, 'data', b.data_iso, 'contexto', b.contexto,
    'formador', b.formador, 'formadorUrl', b.formador_url
  ) end
  from public.badges b where b.codigo = trim(p_codigo);
$$;
revoke all on function public.badge_publico(text) from public;
grant execute on function public.badge_publico(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Emitir os que faltam numa turma, e apontar-lhes o acesso do Repo.
-- Chamada ao abrir o ecra dos Badges: quem ja tem, fica como esta.
-- ---------------------------------------------------------------------
create or replace function public.badges_emitir(p_token uuid, p_repo_turma_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare rt public.repo_turmas; v_sess uuid; v_ctx text; v_mes text;
        r record; v_cod text; v_novos int := 0;
        meses text[] := array['janeiro','fevereiro','março','abril','maio','junho',
                              'julho','agosto','setembro','outubro','novembro','dezembro'];
begin
  perform _repo_root(p_token);
  select * into rt from repo_turmas where id = p_repo_turma_id;
  if rt.id is null then raise exception 'NAO_ENCONTRADO'; end if;

  select id into v_sess from repo_sessoes
   where repo_turma_id = rt.id and tipo = 'badge' limit 1;
  if v_sess is null then raise exception 'SEM_SESSAO'; end if;

  -- "Turma 12345678 · IEFP" - o nome da escola fica gravado como esta hoje
  select 'Turma ' || t.codigo || coalesce(' · ' || e.nome, '')
    into v_ctx
    from turmas t left join espacos e on e.id = t.espaco_id
   where t.id = rt.turma_id;

  v_mes := meses[extract(month from current_date)::int] || ' de ' ||
           extract(year from current_date)::text;

  for r in
    select u.id, trim(coalesce(u.nome,'') || ' ' || coalesce(u.apelido,'')) as nome
      from utilizadores u
     where u.turma_id = rt.turma_id and u.papel = 'Formando'
       and not exists (select 1 from badges b where b.user_id = u.id)
  loop
    v_cod := _badge_codigo();
    insert into badges(codigo, user_id, nome, mes, contexto)
      values (v_cod, r.id, nullif(r.nome,''), v_mes, coalesce(v_ctx,''));
    v_novos := v_novos + 1;
  end loop;

  -- o Repo envia o que estiver em repo_acessos.destino
  update repo_acessos a
     set destino = 'https://crm.cr0x.org/b/?c=' || b.codigo
    from badges b
   where a.sessao_id = v_sess and a.user_id = b.user_id
     and coalesce(a.destino,'') = '';

  return json_build_object('ok', true, 'novos', v_novos);
end $$;
revoke all on function public.badges_emitir(uuid, uuid) from public, anon;
grant execute on function public.badges_emitir(uuid, uuid) to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select public.badge_publico('naoexiste');   -> null
--   select count(*) from public.badges;         -> 0 antes do primeiro clique
