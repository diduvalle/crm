-- =====================================================================
--  FASE 2.0 — PASSO 01: ESPAÇOS
-- =====================================================================
--  Um espaço é uma escola. Hoje a marca do IEFP está escrita em 132
--  sítios do index.html; a partir daqui vem toda de uma linha desta
--  tabela, e a app deixa de saber o nome de escola nenhuma.
--
--  ESTRITAMENTE ADITIVO. Tabelas novas, funções novas, e uma única
--  coluna acrescentada a `turmas` (anulável, que a app antiga ignora).
--  Nada do que o iefpcrm.cr0x.org lê é alterado ou apagado — é a regra
--  da estrada de terra, e é o que deixa o CRM antigo a funcionar para
--  sempre enquanto isto cresce ao lado.
--
--  Idempotente: podes correr outra vez sem partir nada.
--  COMO USAR: Supabase → SQL Editor → cola tudo → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- A tabela
-- ---------------------------------------------------------------------
-- Duas colunas que escapam sempre e depois fazem falta a meio:
--   horas  → o selo e o relatório precisam dela, e ninguém se lembra
--            até faltar;
--   legal_nome + nif → o aviso legal deixa de poder ser texto fixo.
create table if not exists public.espacos (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                check (slug ~ '^[a-z0-9][a-z0-9-]{1,30}$'),
  nome          text not null,

  -- identidade
  logo_url         text not null default '',
  logo_escuro_url  text not null default '',
  cor              text not null default '',
  favicon_url      text not null default '',

  -- legal (público: vai para o aviso legal)
  legal_nome       text not null default '',
  nif              text not null default '',
  morada           text not null default '',
  email_contacto   text not null default '',
  responsavel_dados text not null default '',

  -- email
  remetente_nome   text not null default '',
  email_resposta   text not null default '',
  limite_envios    int  not null default 2,

  -- formação
  -- Mostrar os códigos das UFCD e os números de slide dentro da app?
  -- Só faz sentido onde o curso existe: fora dele apontam para
  -- material que a escola não tem. Desligado por omissão.
  refs_curso       boolean not null default false,
  modulos          text not null default '',
  horas            text not null default '',
  formador         text not null default '',

  -- selo
  selo_ligado      boolean not null default false,
  selo_texto       text not null default '',
  selo_emissor     text not null default '',

  -- estado: arquiva-se, nunca se apaga. Os links continuam a abrir,
  -- só não se cria nada de novo.
  arquivado        boolean not null default false,
  criado_em        timestamptz not null default now(),
  criado_por       text not null default ''
);

-- A tabela já existe em produção, e o `if not exists` de cima não lhe
-- acrescenta colunas nenhumas.
alter table public.espacos add column if not exists refs_curso boolean not null default false;

-- Nomes que não podem ser espaço: colidem com caminhos do site ou com
-- o que já está publicado. O `iefp` fica reservado desde o primeiro dia
-- para as turmas antigas irem para lá quando forem arrumadas.
create table if not exists public.espacos_reservados (
  slug text primary key
);
insert into public.espacos_reservados(slug) values
  ('iefp'),('admin'),('api'),('app'),('www'),('b'),('sobre'),('manual'),
  ('repo'),('assets'),('estilo'),('static'),('login'),('root'),('null'),
  ('undefined'),('crm')
on conflict (slug) do nothing;

-- A ligação turma → espaço. ANULÁVEL de propósito: as turmas que já
-- existem ficam com NULL e a app antiga nunca olha para esta coluna.
alter table public.turmas
  add column if not exists espaco_id uuid references public.espacos(id);
create index if not exists ix_turmas_espaco on public.turmas (espaco_id);

alter table public.espacos            enable row level security;
alter table public.espacos_reservados enable row level security;

-- ---------------------------------------------------------------------
-- Leitura pública: a marca ANTES do login
-- ---------------------------------------------------------------------
-- É esta a função que resolve o problema de fundo. Hoje a marca só
-- existe depois de entrar, porque vive no `state` do browser; aqui ela
-- existe mal a página abre, a partir do slug no endereço.
--
-- Não devolve nada que não esteja destinado a ser lido por quem abre a
-- página: identidade, dados legais (que por lei são públicos) e o texto
-- do selo. Fora ficam o limite de envios e quem criou o espaço.
create or replace function public.espaco_publico(p_slug text)
returns json language sql security definer set search_path = public as $$
  select case when e.id is null then null else json_build_object(
    'slug', e.slug, 'nome', e.nome,
    'logo', e.logo_url, 'logoEscuro', e.logo_escuro_url,
    'cor', e.cor, 'favicon', e.favicon_url,
    'legalNome', e.legal_nome, 'nif', e.nif, 'morada', e.morada,
    'emailContacto', e.email_contacto, 'responsavelDados', e.responsavel_dados,
    'remetenteNome', e.remetente_nome, 'emailResposta', e.email_resposta,
    'modulos', e.modulos, 'horas', e.horas, 'formador', e.formador,
    'seloLigado', e.selo_ligado, 'seloTexto', e.selo_texto,
    'seloEmissor', e.selo_emissor,
    'refsCurso', e.refs_curso,
    'arquivado', e.arquivado
  ) end
  from public.espacos e
  where e.slug = lower(trim(p_slug));
$$;

-- Dado o número da turma, em que espaço é que ela vive. Serve para a
-- app vestir a marca certa quando alguém entra pelo número da turma em
-- vez de entrar pelo endereço do espaço.
create or replace function public.turma_espaco(p_codigo text)
returns json language sql security definer set search_path = public as $$
  select public.espaco_publico(e.slug)
  from public.turmas t join public.espacos e on e.id = t.espaco_id
  where t.codigo = p_codigo;
$$;

-- ---------------------------------------------------------------------
-- Gestão: só root (o backoffice do Diogo)
-- ---------------------------------------------------------------------
-- Não há registo aberto e não há auto-criação: o slug é uma
-- reivindicação (/iefp lê-se como "o CRM do IEFP") e, com selos
-- públicos, um impostor passaria a emitir provas de formação numa
-- escola real. Quem cria espaços é quem tem a password de root.
create or replace function public.espacos_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare r json;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;
  select coalesce(json_agg(to_jsonb(e) order by e.arquivado, e.nome), '[]'::json)
    into r from public.espacos e;
  return r;
end $$;

-- Cria ou atualiza. Recebe um objeto e só lê dele as chaves que
-- conhece: o que vier a mais é ignorado em vez de rebentar.
create or replace function public.espaco_guardar(
  p_token uuid, p_id uuid, p_dados jsonb
) returns json
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_slug text;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;
  v_slug := lower(trim(coalesce(p_dados->>'slug','')));
  if v_slug = '' then raise exception 'SLUG_EM_FALTA'; end if;
  if v_slug !~ '^[a-z0-9][a-z0-9-]{1,30}$' then raise exception 'SLUG_INVALIDO'; end if;
  if exists (select 1 from espacos_reservados where slug = v_slug)
     and not exists (select 1 from espacos where id = p_id and slug = v_slug) then
    raise exception 'SLUG_RESERVADO';
  end if;

  if p_id is null then
    insert into espacos(slug, nome) values (v_slug, coalesce(p_dados->>'nome', v_slug))
      returning id into v_id;
  else
    v_id := p_id;
    if not exists (select 1 from espacos where id = v_id) then raise exception 'NAO_EXISTE'; end if;
  end if;

  update espacos set
    slug              = v_slug,
    nome              = coalesce(p_dados->>'nome', nome),
    logo_url          = coalesce(p_dados->>'logo', logo_url),
    logo_escuro_url   = coalesce(p_dados->>'logoEscuro', logo_escuro_url),
    cor               = coalesce(p_dados->>'cor', cor),
    favicon_url       = coalesce(p_dados->>'favicon', favicon_url),
    legal_nome        = coalesce(p_dados->>'legalNome', legal_nome),
    nif               = coalesce(p_dados->>'nif', nif),
    morada            = coalesce(p_dados->>'morada', morada),
    email_contacto    = coalesce(p_dados->>'emailContacto', email_contacto),
    responsavel_dados = coalesce(p_dados->>'responsavelDados', responsavel_dados),
    remetente_nome    = coalesce(p_dados->>'remetenteNome', remetente_nome),
    email_resposta    = coalesce(p_dados->>'emailResposta', email_resposta),
    limite_envios     = coalesce((p_dados->>'limiteEnvios')::int, limite_envios),
    modulos           = coalesce(p_dados->>'modulos', modulos),
    horas             = coalesce(p_dados->>'horas', horas),
    formador          = coalesce(p_dados->>'formador', formador),
    selo_ligado       = coalesce((p_dados->>'seloLigado')::boolean, selo_ligado),
    selo_texto        = coalesce(p_dados->>'seloTexto', selo_texto),
    selo_emissor      = coalesce(p_dados->>'seloEmissor', selo_emissor),
    refs_curso        = coalesce((p_dados->>'refsCurso')::boolean, refs_curso),
    arquivado         = coalesce((p_dados->>'arquivado')::boolean, arquivado)
  where id = v_id;

  return (select to_json(e) from espacos e where e.id = v_id);
end $$;

-- ---------------------------------------------------------------------
-- Criar turma DENTRO de um espaço
-- ---------------------------------------------------------------------
-- A `criar_turma` antiga fica exatamente como está, com o portão do
-- email `for<n>@formacao.iefp.pt`, a servir o iefpcrm congelado — se um
-- dia um formador do IEFP quiser usá-lo, continua a conseguir.
--
-- Esta é outra função. Não tem portão de email porque não precisa:
-- quem a chama já teve de provar que é root. O formador não se
-- inscreve, é criado.
create or replace function public.criar_turma_em(
  p_token uuid, p_slug text, p_codigo text, p_nome_turma text,
  p_nome text, p_apelido text, p_email text,
  p_username text, p_password text
) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_espaco uuid; v_turma uuid; v_user uuid; v_sess uuid; v_recovery text;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;

  select id into v_espaco from espacos
   where slug = lower(trim(p_slug)) and not arquivado;
  if v_espaco is null then raise exception 'ESPACO_NAO_EXISTE'; end if;

  if p_codigo !~ '^[0-9]{8}$' then raise exception 'CODIGO_INVALIDO'; end if;
  if exists (select 1 from turmas where codigo = p_codigo) then
    raise exception 'TURMA_JA_EXISTE';
  end if;
  if coalesce(trim(p_username),'') = '' or coalesce(p_password,'') = '' then
    raise exception 'DADOS_EM_FALTA';
  end if;

  insert into turmas(codigo, nome, criado_por, espaco_id)
    values (p_codigo,
            coalesce(nullif(trim(p_nome_turma),''), 'Turma '||p_codigo),
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

  -- O recovery é mostrado UMA vez a quem cria; na base fica só o hash.
  return json_build_object(
    'token', v_sess,
    'turma', json_build_object('codigo', p_codigo),
    'espaco', lower(trim(p_slug)),
    'recovery', v_recovery,
    'user', json_build_object('id', v_user, 'username', lower(trim(p_username)),
            'nome', p_nome, 'apelido', coalesce(p_apelido,''), 'papel', 'Administrador'));
end $$;

-- Mover uma turma que já existe para um espaço (as antigas do IEFP).
create or replace function public.turma_mover(
  p_token uuid, p_codigo text, p_slug text
) returns json
language plpgsql security definer set search_path = public as $$
declare v_espaco uuid;
begin
  if not _is_root(p_token) then raise exception 'SEM_PERMISSAO'; end if;
  select id into v_espaco from espacos where slug = lower(trim(p_slug));
  if v_espaco is null then raise exception 'ESPACO_NAO_EXISTE'; end if;
  update turmas set espaco_id = v_espaco where codigo = p_codigo;
  if not found then raise exception 'TURMA_NAO_EXISTE'; end if;
  return json_build_object('ok', true, 'codigo', p_codigo, 'espaco', lower(trim(p_slug)));
end $$;

-- ---------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------
-- Só as duas de leitura ficam abertas ao browser. As de gestão exigem
-- token de root, e o token nunca sai do browser do Diogo.
revoke all on function public.espaco_publico(text)   from public, anon;
revoke all on function public.turma_espaco(text)     from public, anon;
grant execute on function public.espaco_publico(text) to anon, authenticated;
grant execute on function public.turma_espaco(text)   to anon, authenticated;
grant execute on function public.espacos_listar(uuid) to anon, authenticated;
grant execute on function public.espaco_guardar(uuid, uuid, jsonb) to anon, authenticated;
grant execute on function public.criar_turma_em(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.turma_mover(uuid, text, text) to anon, authenticated;

-- O PostgREST guarda o esquema em cache; sem isto as funções novas
-- só aparecem daqui a uns minutos.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select public.espaco_publico('iefp');        -> null (ainda não existe)
--   select count(*) from public.espacos;         -> 0
--   select count(*) from public.turmas;          -> as de sempre, intactas
