-- =====================================================================
--  CRM - TESTES E AVALIAÇÕES
-- =====================================================================
--  Substitui os Google Forms: criar o teste uma vez, aplicá-lo a uma
--  turma, enviar um link pessoal a cada formando, corrigir e devolver.
--
--  TRÊS IDEIAS QUE EXPLICAM O RESTO:
--
--  1. O TESTE É UM MODELO; A APLICAÇÃO É QUE É DA TURMA. Ao aplicar, as
--     perguntas são COPIADAS para a aplicação (`itens` jsonb). Mexer no
--     modelo depois não mexe no que a turma respondeu - um teste
--     respondido tem de ficar como estava, tal como um badge guarda o
--     nome da escola como ela se chamava nesse dia.
--
--  2. NÃO HÁ PERGUNTA "NOME". O link é pessoal: o token do acesso diz
--     quem está a responder. Ninguém se engana a escrever o nome, nem
--     responde duas vezes com nomes diferentes.
--
--  3. O ENVIO JÁ EXISTE. Uma aplicação cria uma `repo_sessao` (tipo
--     'teste') e um `repo_acesso` por formando, com `destino` a apontar
--     para a página do teste com o seu token. A partir daí é a máquina
--     do Repo que envia, regista aberturas e reenvia. A devolução das
--     notas é uma segunda sessão (tipo 'teste-nota'), para o registo do
--     primeiro envio não ser apagado pelo segundo.
--
--  A chave de correção NUNCA sai do servidor enquanto o teste está a ser
--  respondido: `teste_abrir` só devolve as respostas certas depois de a
--  nota ser devolvida.
--
--  COMO USAR: Supabase -> SQL Editor -> colar -> Run. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) O modelo
-- ---------------------------------------------------------------------
create table if not exists public.testes (
  id            uuid primary key default gen_random_uuid(),
  espaco_id     uuid references public.espacos(id) on delete cascade,  -- null = de todas as escolas
  titulo        text not null,
  descricao     text not null default '',
  modulo        text not null default '',        -- "10868"
  chave_ok      boolean not null default false,  -- as respostas certas foram confirmadas?
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- tipo: seccao | escolha | vf | aberta
--   escolha -> opcoes ["a","b",...], certa = índice (0,1,2...)
--   vf      -> certa = true/false
--   aberta  -> sem chave: corrige-se à mão
--   seccao  -> só um título no meio do teste, não conta pontos
create table if not exists public.teste_itens (
  id        uuid primary key default gen_random_uuid(),
  teste_id  uuid not null references public.testes(id) on delete cascade,
  ordem     int  not null default 0,
  tipo      text not null default 'escolha',
  enunciado text not null default '',
  ajuda     text not null default '',
  opcoes    jsonb not null default '[]'::jsonb,
  certa     jsonb,
  pontos    numeric not null default 1
);
create index if not exists ix_teste_itens on public.teste_itens(teste_id, ordem);

-- ---------------------------------------------------------------------
-- 2) A aplicação a uma turma (com as perguntas congeladas)
-- ---------------------------------------------------------------------
create table if not exists public.teste_aplicacoes (
  id             uuid primary key default gen_random_uuid(),
  teste_id       uuid references public.testes(id) on delete set null,
  repo_turma_id  uuid not null references public.repo_turmas(id) on delete cascade,
  turma_id       uuid not null references public.turmas(id) on delete cascade,
  sessao_id      uuid references public.repo_sessoes(id) on delete set null,
  sessao_nota_id uuid references public.repo_sessoes(id) on delete set null,
  titulo         text not null,
  modulo         text not null default '',
  itens          jsonb not null default '[]'::jsonb,
  pontos_total   numeric not null default 0,
  fechado        boolean not null default false,  -- deixa de aceitar respostas
  criado_em      timestamptz not null default now()
);
create index if not exists ix_teste_apl_turma on public.teste_aplicacoes(repo_turma_id);

-- respostas: {item_id: valor}   pontos: {item_id: numero}   comentarios: {item_id: texto}
create table if not exists public.teste_respostas (
  id            uuid primary key default gen_random_uuid(),
  aplicacao_id  uuid not null references public.teste_aplicacoes(id) on delete cascade,
  user_id       uuid not null references public.utilizadores(id) on delete cascade,
  respostas     jsonb not null default '{}'::jsonb,
  pontos        jsonb not null default '{}'::jsonb,
  comentarios   jsonb not null default '{}'::jsonb,
  comentario    text  not null default '',
  nota          numeric,
  aberto_em     timestamptz,
  submetido_em  timestamptz,
  corrigido_em  timestamptz,
  devolvido_em  timestamptz,
  unique (aplicacao_id, user_id)
);
create index if not exists ix_teste_resp_apl on public.teste_respostas(aplicacao_id);

alter table public.testes           enable row level security;
alter table public.teste_itens      enable row level security;
alter table public.teste_aplicacoes enable row level security;
alter table public.teste_respostas  enable row level security;

-- ---------------------------------------------------------------------
-- 3) Correção automática das perguntas fechadas
--    Devolve {item_id: pontos}. As abertas não entram - ficam para a mão.
-- ---------------------------------------------------------------------
create or replace function public._teste_auto(p_itens jsonb, p_respostas jsonb)
returns jsonb language plpgsql immutable as $$
declare it jsonb; out jsonb := '{}'::jsonb; r jsonb; certo boolean;
begin
  for it in select * from jsonb_array_elements(coalesce(p_itens,'[]'::jsonb)) loop
    if (it->>'tipo') in ('escolha','vf') and (it->'certa') is not null
       and jsonb_typeof(it->'certa') <> 'null' then
      r := p_respostas -> (it->>'id');
      certo := r is not null and jsonb_typeof(r) <> 'null' and r = (it->'certa');
      out := out || jsonb_build_object(it->>'id',
               case when certo then coalesce((it->>'pontos')::numeric, 0) else 0 end);
    end if;
  end loop;
  return out;
end $$;

-- Soma de um mapa {item: pontos}
create or replace function public._teste_soma(p jsonb)
returns numeric language sql immutable as $$
  -- #>>'{}' tira o valor como texto sem aspas: um "1.5" em JSON não estraga a soma
  select coalesce(sum((value #>> '{}')::numeric), 0)
    from jsonb_each(coalesce(p, '{}'::jsonb));
$$;

-- Há perguntas abertas por corrigir?
create or replace function public._teste_tem_abertas(p_itens jsonb)
returns boolean language sql immutable as $$
  select exists (select 1 from jsonb_array_elements(coalesce(p_itens,'[]'::jsonb)) it
                  where it->>'tipo' = 'aberta');
$$;

revoke all on function public._teste_auto(jsonb,jsonb)  from public, anon, authenticated;
revoke all on function public._teste_soma(jsonb)        from public, anon, authenticated;
revoke all on function public._teste_tem_abertas(jsonb) from public, anon, authenticated;

-- =====================================================================
--  LADO DO FORMADOR (tudo atrás de _repo_root)
-- =====================================================================

-- Lista da biblioteca -------------------------------------------------
create or replace function public.testes_listar(p_token uuid)
returns table(id uuid, titulo text, descricao text, modulo text, espaco_id uuid,
              escola text, chave_ok boolean, n_itens bigint, n_perguntas bigint,
              pontos numeric, por_marcar bigint, n_aplicacoes bigint, atualizado_em timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return query
    select t.id, t.titulo, t.descricao, t.modulo, t.espaco_id, coalesce(e.nome,''), t.chave_ok,
           (select count(*) from teste_itens i where i.teste_id = t.id),
           (select count(*) from teste_itens i where i.teste_id = t.id and i.tipo <> 'seccao'),
           (select coalesce(sum(i.pontos),0) from teste_itens i where i.teste_id = t.id and i.tipo <> 'seccao'),
           (select count(*) from teste_itens i where i.teste_id = t.id
             and i.tipo in ('escolha','vf') and (i.certa is null or jsonb_typeof(i.certa) = 'null')),
           (select count(*) from teste_aplicacoes a where a.teste_id = t.id),
           t.atualizado_em
      from testes t left join espacos e on e.id = t.espaco_id
     order by t.atualizado_em desc;
end $$;

-- Um teste com as perguntas ------------------------------------------
create or replace function public.teste_ler(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare t public.testes; v_itens json;
begin
  perform _repo_root(p_token);
  select * into t from testes where id = p_id;
  if t.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  select coalesce(json_agg(json_build_object(
           'id', i.id, 'tipo', i.tipo, 'enunciado', i.enunciado, 'ajuda', i.ajuda,
           'opcoes', i.opcoes, 'certa', i.certa, 'pontos', i.pontos) order by i.ordem), '[]'::json)
    into v_itens from teste_itens i where i.teste_id = t.id;
  return json_build_object('id', t.id, 'titulo', t.titulo, 'descricao', t.descricao,
    'modulo', t.modulo, 'espaco_id', t.espaco_id, 'chave_ok', t.chave_ok, 'itens', v_itens);
end $$;

-- Gravar (cria ou substitui) ------------------------------------------
--   Os itens vêm todos de uma vez e substituem os que lá estavam. Os que
--   trazem `id` mantêm-no, para as aplicações antigas continuarem a
--   reconhecer a pergunta.
create or replace function public.teste_gravar(p_token uuid, p_id uuid, p_dados jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid := p_id; it jsonb; n int := 0; v_ids uuid[] := '{}'; v_it uuid;
begin
  perform _repo_root(p_token);
  if coalesce(trim(p_dados->>'titulo'),'') = '' then raise exception 'SEM_TITULO'; end if;

  if v_id is null then
    insert into testes(espaco_id, titulo, descricao, modulo, chave_ok)
      values (nullif(p_dados->>'espaco_id','')::uuid, trim(p_dados->>'titulo'),
              coalesce(p_dados->>'descricao',''), coalesce(p_dados->>'modulo',''),
              coalesce((p_dados->>'chave_ok')::boolean, false))
      returning id into v_id;
  else
    update testes set titulo = trim(p_dados->>'titulo'),
           descricao = coalesce(p_dados->>'descricao',''),
           modulo    = coalesce(p_dados->>'modulo',''),
           espaco_id = nullif(p_dados->>'espaco_id','')::uuid,
           chave_ok  = coalesce((p_dados->>'chave_ok')::boolean, chave_ok),
           atualizado_em = now()
     where id = v_id;
    if not found then raise exception 'NAO_ENCONTRADO'; end if;
  end if;

  for it in select * from jsonb_array_elements(coalesce(p_dados->'itens','[]'::jsonb)) loop
    v_it := nullif(it->>'id','')::uuid;
    if v_it is not null and exists (select 1 from teste_itens where id = v_it and teste_id = v_id) then
      update teste_itens set ordem = n, tipo = coalesce(it->>'tipo','escolha'),
             enunciado = coalesce(it->>'enunciado',''), ajuda = coalesce(it->>'ajuda',''),
             opcoes = coalesce(it->'opcoes','[]'::jsonb),
             certa = case when jsonb_typeof(coalesce(it->'certa','null'::jsonb)) = 'null'
                          then null else it->'certa' end,
             pontos = coalesce((it->>'pontos')::numeric, 1)
       where id = v_it;
    else
      insert into teste_itens(teste_id, ordem, tipo, enunciado, ajuda, opcoes, certa, pontos)
        values (v_id, n, coalesce(it->>'tipo','escolha'), coalesce(it->>'enunciado',''),
                coalesce(it->>'ajuda',''), coalesce(it->'opcoes','[]'::jsonb),
                case when jsonb_typeof(coalesce(it->'certa','null'::jsonb)) = 'null'
                     then null else it->'certa' end,
                coalesce((it->>'pontos')::numeric, 1))
        returning id into v_it;
    end if;
    v_ids := v_ids || v_it;
    n := n + 1;
  end loop;

  delete from teste_itens where teste_id = v_id and not (id = any(v_ids));
  update testes set atualizado_em = now() where id = v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.teste_apagar(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  delete from testes where id = p_id;
  return json_build_object('ok', found);
end $$;

-- Aplicar a uma turma -------------------------------------------------
--   Congela as perguntas, cria a sessão de envio e o link de cada um.
create or replace function public.teste_aplicar(p_token uuid, p_teste_id uuid, p_repo_turma_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare t public.testes; rt public.repo_turmas; v_itens jsonb; v_total numeric;
        v_apl uuid; v_sess uuid; v_n int;
begin
  perform _repo_root(p_token);
  select * into t  from testes      where id = p_teste_id;
  select * into rt from repo_turmas where id = p_repo_turma_id;
  if t.id is null or rt.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  if not t.chave_ok then raise exception 'CHAVE_POR_CONFIRMAR'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', i.id, 'tipo', i.tipo, 'enunciado', i.enunciado, 'ajuda', i.ajuda,
           'opcoes', i.opcoes, 'certa', i.certa, 'pontos', i.pontos) order by i.ordem), '[]'::jsonb),
         coalesce(sum(i.pontos) filter (where i.tipo <> 'seccao'), 0)
    into v_itens, v_total
    from teste_itens i where i.teste_id = t.id;
  if jsonb_array_length(v_itens) = 0 then raise exception 'TESTE_VAZIO'; end if;

  insert into repo_sessoes(repo_turma_id, turma_id, tipo, titulo, texto, link, modulo,
                           assunto, cabecalho, saudacao, botao, rodape)
    values (rt.id, rt.turma_id, 'teste', t.titulo,
            E'Tens uma avaliação para responder.\nO link é só teu: abre, responde ao teu ritmo e submete no fim. O que escreveres fica guardado à medida que respondes.',
            'https://crm.cr0x.org/t/', coalesce(t.modulo,''),
            'Avaliação: ' || t.titulo, t.titulo, 'Olá {nome},', 'Responder à avaliação',
            E'Este link é pessoal - não o partilhes. A abertura e a hora de entrega ficam registadas.')
    returning id into v_sess;

  insert into teste_aplicacoes(teste_id, repo_turma_id, turma_id, sessao_id, titulo, modulo,
                               itens, pontos_total)
    values (t.id, rt.id, rt.turma_id, v_sess, t.titulo, coalesce(t.modulo,''), v_itens, v_total)
    returning id into v_apl;

  insert into repo_acessos(sessao_id, user_id, email, email2)
    select v_sess, u.id,
           coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),'')), null
      from utilizadores u
     where u.turma_id = rt.turma_id and u.papel = 'Formando'
       and coalesce(nullif(trim(u.email),''), nullif(trim(u.email2),'')) is not null;
  get diagnostics v_n = row_count;

  update repo_acessos set destino = 'https://crm.cr0x.org/t/?t=' || token
   where sessao_id = v_sess;

  return json_build_object('ok', true, 'aplicacao_id', v_apl, 'sessao_id', v_sess, 'destinatarios', v_n);
end $$;

-- As aplicações de uma turma -----------------------------------------
create or replace function public.teste_aplicacoes_da_turma(p_token uuid, p_repo_turma_id uuid)
returns table(id uuid, titulo text, modulo text, criado_em timestamptz, fechado boolean,
              pontos_total numeric, sessao_id uuid, sessao_nota_id uuid,
              destinatarios bigint, enviados bigint, entregues bigint,
              corrigidos bigint, devolvidos bigint, media numeric)
language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return query
    select a.id, a.titulo, a.modulo, a.criado_em, a.fechado, a.pontos_total,
           a.sessao_id, a.sessao_nota_id,
           (select count(*) from repo_acessos x where x.sessao_id = a.sessao_id),
           (select count(*) from repo_acessos x where x.sessao_id = a.sessao_id and x.enviado_em is not null),
           (select count(*) from teste_respostas r where r.aplicacao_id = a.id and r.submetido_em is not null),
           (select count(*) from teste_respostas r where r.aplicacao_id = a.id and r.corrigido_em is not null),
           (select count(*) from teste_respostas r where r.aplicacao_id = a.id and r.devolvido_em is not null),
           (select round(avg(r.nota),2) from teste_respostas r where r.aplicacao_id = a.id and r.corrigido_em is not null)
      from teste_aplicacoes a
     where a.repo_turma_id = p_repo_turma_id
     order by a.criado_em desc;
end $$;

-- A pauta: uma linha por formando -------------------------------------
create or replace function public.teste_pauta(p_token uuid, p_aplicacao_id uuid)
returns table(user_id uuid, nome text, username text, email text, acesso_id uuid,
              enviado_em timestamptz, primeiro_clique timestamptz, erro text,
              resposta_id uuid, submetido_em timestamptz, corrigido_em timestamptz,
              devolvido_em timestamptz, nota numeric, respostas jsonb, pontos jsonb)
language plpgsql security definer set search_path = public as $$
declare a public.teste_aplicacoes;
begin
  perform _repo_root(p_token);
  select * into a from teste_aplicacoes where id = p_aplicacao_id;
  if a.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  return query
    select u.id, trim(coalesce(u.nome,'')||' '||coalesce(u.apelido,'')), u.username,
           ac.email, ac.id, ac.enviado_em, ac.primeiro_clique, ac.erro,
           r.id, r.submetido_em, r.corrigido_em, r.devolvido_em, r.nota,
           coalesce(r.respostas,'{}'::jsonb), coalesce(r.pontos,'{}'::jsonb)
      from utilizadores u
      left join repo_acessos   ac on ac.sessao_id = a.sessao_id and ac.user_id = u.id
      left join teste_respostas r on r.aplicacao_id = a.id      and r.user_id  = u.id
     where u.turma_id = a.turma_id and u.papel = 'Formando'
     order by u.nome, u.apelido;
end $$;

-- As perguntas congeladas (para corrigir e para os gráficos) ----------
create or replace function public.teste_aplicacao_ler(p_token uuid, p_aplicacao_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare a public.teste_aplicacoes;
begin
  perform _repo_root(p_token);
  select * into a from teste_aplicacoes where id = p_aplicacao_id;
  if a.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('id', a.id, 'titulo', a.titulo, 'modulo', a.modulo,
    'itens', a.itens, 'pontos_total', a.pontos_total, 'fechado', a.fechado,
    'sessao_id', a.sessao_id, 'sessao_nota_id', a.sessao_nota_id);
end $$;

-- Corrigir uma entrega -------------------------------------------------
--   Chegam só os pontos das abertas; os das fechadas voltam a ser
--   calculados aqui, para uma correção à mão nunca poder inventar pontos
--   numa pergunta de escolha.
create or replace function public.teste_corrigir(
  p_token uuid, p_resposta_id uuid, p_pontos jsonb, p_comentarios jsonb, p_comentario text
) returns json language plpgsql security definer set search_path = public as $$
declare r public.teste_respostas; a public.teste_aplicacoes;
        v_auto jsonb; v_mao jsonb := '{}'::jsonb; it jsonb; v_p numeric; v_nota numeric;
begin
  perform _repo_root(p_token);
  select * into r from teste_respostas where id = p_resposta_id;
  if r.id is null then raise exception 'NAO_ENCONTRADO'; end if;
  select * into a from teste_aplicacoes where id = r.aplicacao_id;

  v_auto := _teste_auto(a.itens, r.respostas);

  for it in select * from jsonb_array_elements(a.itens) loop
    if (it->>'tipo') = 'aberta' then
      v_p := coalesce((p_pontos->>(it->>'id'))::numeric, 0);
      v_p := greatest(0, least(v_p, coalesce((it->>'pontos')::numeric, 0)));
      v_mao := v_mao || jsonb_build_object(it->>'id', v_p);
    end if;
  end loop;

  v_nota := _teste_soma(v_auto) + _teste_soma(v_mao);
  update teste_respostas
     set pontos = v_auto || v_mao,
         comentarios = coalesce(p_comentarios,'{}'::jsonb),
         comentario = coalesce(p_comentario,''),
         nota = v_nota, corrigido_em = now()
   where id = r.id;
  return json_build_object('ok', true, 'nota', v_nota, 'total', a.pontos_total);
end $$;

-- Devolver as notas ----------------------------------------------------
--   Segunda sessão, para o registo do primeiro envio ficar de pé. O link
--   é outro, mas a página é a mesma: quem abrir o link antigo também vê
--   o resultado, porque a página mostra sempre o estado atual.
create or replace function public.teste_devolver(p_token uuid, p_aplicacao_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare a public.teste_aplicacoes; v_sess uuid; v_n int;
begin
  perform _repo_root(p_token);
  select * into a from teste_aplicacoes where id = p_aplicacao_id;
  if a.id is null then raise exception 'NAO_ENCONTRADO'; end if;

  v_sess := a.sessao_nota_id;
  if v_sess is null then
    insert into repo_sessoes(repo_turma_id, turma_id, tipo, titulo, texto, link, modulo,
                             assunto, cabecalho, saudacao, botao, rodape)
      values (a.repo_turma_id, a.turma_id, 'teste-nota', a.titulo,
              E'A tua avaliação já está corrigida.\nNo teu link vês a nota, o que respondeste e os comentários pergunta a pergunta.',
              'https://crm.cr0x.org/t/', a.modulo,
              'Resultado: ' || a.titulo, a.titulo, 'Olá {nome},', 'Ver o meu resultado',
              E'Se houver alguma coisa que não percebas na correção, responde a este email.')
      returning id into v_sess;
    update teste_aplicacoes set sessao_nota_id = v_sess where id = a.id;
  end if;

  -- só quem está corrigido; quem já tem linha nesta sessão fica como está
  insert into repo_acessos(sessao_id, user_id, email, email2)
    select v_sess, u.id,
           coalesce(nullif(lower(trim(u.email2)),''), nullif(lower(trim(u.email)),'')), null
      from teste_respostas r
      join utilizadores u on u.id = r.user_id
     where r.aplicacao_id = a.id and r.corrigido_em is not null
       and coalesce(nullif(trim(u.email),''), nullif(trim(u.email2),'')) is not null
       and not exists (select 1 from repo_acessos x where x.sessao_id = v_sess and x.user_id = u.id);
  get diagnostics v_n = row_count;

  update repo_acessos set destino = 'https://crm.cr0x.org/t/?t=' || token
   where sessao_id = v_sess and coalesce(destino,'') = '';

  update teste_respostas set devolvido_em = coalesce(devolvido_em, now())
   where aplicacao_id = a.id and corrigido_em is not null;

  return json_build_object('ok', true, 'sessao_id', v_sess, 'novos', v_n);
end $$;

create or replace function public.teste_fechar(p_token uuid, p_aplicacao_id uuid, p_fechado boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  update teste_aplicacoes set fechado = coalesce(p_fechado,true) where id = p_aplicacao_id;
  return json_build_object('ok', found);
end $$;

create or replace function public.teste_aplicacao_apagar(p_token uuid, p_aplicacao_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare a public.teste_aplicacoes;
begin
  perform _repo_root(p_token);
  select * into a from teste_aplicacoes where id = p_aplicacao_id;
  if a.id is null then return json_build_object('ok', false); end if;
  delete from repo_sessoes where id in (a.sessao_id, a.sessao_nota_id);
  delete from teste_aplicacoes where id = a.id;   -- leva as respostas atrás
  return json_build_object('ok', true);
end $$;

revoke all on function public.testes_listar(uuid) from public, anon;
revoke all on function public.teste_ler(uuid,uuid) from public, anon;
revoke all on function public.teste_gravar(uuid,uuid,jsonb) from public, anon;
revoke all on function public.teste_apagar(uuid,uuid) from public, anon;
revoke all on function public.teste_aplicar(uuid,uuid,uuid) from public, anon;
revoke all on function public.teste_aplicacoes_da_turma(uuid,uuid) from public, anon;
revoke all on function public.teste_pauta(uuid,uuid) from public, anon;
revoke all on function public.teste_aplicacao_ler(uuid,uuid) from public, anon;
revoke all on function public.teste_corrigir(uuid,uuid,jsonb,jsonb,text) from public, anon;
revoke all on function public.teste_devolver(uuid,uuid) from public, anon;
revoke all on function public.teste_fechar(uuid,uuid,boolean) from public, anon;
revoke all on function public.teste_aplicacao_apagar(uuid,uuid) from public, anon;

grant execute on function public.testes_listar(uuid) to anon, authenticated;
grant execute on function public.teste_ler(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_gravar(uuid,uuid,jsonb) to anon, authenticated;
grant execute on function public.teste_apagar(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_aplicar(uuid,uuid,uuid) to anon, authenticated;
grant execute on function public.teste_aplicacoes_da_turma(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_pauta(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_aplicacao_ler(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_corrigir(uuid,uuid,jsonb,jsonb,text) to anon, authenticated;
grant execute on function public.teste_devolver(uuid,uuid) to anon, authenticated;
grant execute on function public.teste_fechar(uuid,uuid,boolean) to anon, authenticated;
grant execute on function public.teste_aplicacao_apagar(uuid,uuid) to anon, authenticated;

-- =====================================================================
--  LADO DO FORMANDO (só o token do link - não há conta nem palavra-passe)
-- =====================================================================

-- Abrir o teste --------------------------------------------------------
--   modo: responder | entregue | resultado | fechado
--   Enquanto se responde, as perguntas vão SEM a chave. A chave só entra
--   quando a nota já foi devolvida.
create or replace function public.teste_abrir(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare ac public.repo_acessos; s public.repo_sessoes; a public.teste_aplicacoes;
        r public.teste_respostas; v_nome text; v_modo text; v_itens jsonb;
begin
  select * into ac from repo_acessos where token = p_token;
  if ac.id is null then return null; end if;
  select * into s from repo_sessoes where id = ac.sessao_id;
  if s.id is null or s.tipo not in ('teste','teste-nota') then return null; end if;
  select * into a from teste_aplicacoes
   where sessao_id = s.id or sessao_nota_id = s.id limit 1;
  if a.id is null then return null; end if;

  select trim(coalesce(u.nome,'')||' '||coalesce(u.apelido,'')) into v_nome
    from utilizadores u where u.id = ac.user_id;

  select * into r from teste_respostas where aplicacao_id = a.id and user_id = ac.user_id;
  if r.id is null then
    insert into teste_respostas(aplicacao_id, user_id, aberto_em)
      values (a.id, ac.user_id, now())
      on conflict (aplicacao_id, user_id) do update set aberto_em = coalesce(teste_respostas.aberto_em, now())
      returning * into r;
  elsif r.aberto_em is null then
    update teste_respostas set aberto_em = now() where id = r.id returning * into r;
  end if;

  v_modo := case
    when r.devolvido_em is not null then 'resultado'
    when r.submetido_em is not null then 'entregue'
    when a.fechado                  then 'fechado'
    else 'responder' end;

  -- a chave só viaja quando já não muda nada
  if v_modo = 'resultado' then
    v_itens := a.itens;
  else
    select coalesce(jsonb_agg(x.it - 'certa' order by x.ord), '[]'::jsonb) into v_itens
      from jsonb_array_elements(a.itens) with ordinality as x(it, ord);
  end if;

  return json_build_object(
    'modo', v_modo, 'titulo', a.titulo, 'modulo', a.modulo, 'nome', v_nome,
    'itens', v_itens, 'pontos_total', a.pontos_total,
    'respostas', coalesce(r.respostas,'{}'::jsonb),
    'submetido_em', r.submetido_em,
    'nota', case when v_modo = 'resultado' then r.nota else null end,
    'pontos', case when v_modo = 'resultado' then r.pontos else '{}'::jsonb end,
    'comentarios', case when v_modo = 'resultado' then r.comentarios else '{}'::jsonb end,
    'comentario', case when v_modo = 'resultado' then r.comentario else '' end);
end $$;

-- Ir guardando ---------------------------------------------------------
create or replace function public.teste_guardar(p_token uuid, p_respostas jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare ac public.repo_acessos; s public.repo_sessoes; a public.teste_aplicacoes;
begin
  select * into ac from repo_acessos where token = p_token;
  if ac.id is null then return json_build_object('ok', false); end if;
  select * into s from repo_sessoes where id = ac.sessao_id;
  select * into a from teste_aplicacoes where sessao_id = s.id or sessao_nota_id = s.id limit 1;
  if a.id is null or a.fechado then return json_build_object('ok', false); end if;

  update teste_respostas set respostas = coalesce(p_respostas,'{}'::jsonb)
   where aplicacao_id = a.id and user_id = ac.user_id and submetido_em is null;
  return json_build_object('ok', found);
end $$;

-- Submeter -------------------------------------------------------------
--   As fechadas contam-se aqui. Se o teste não tiver perguntas abertas,
--   fica corrigido de uma vez - só falta o formador devolver.
create or replace function public.teste_submeter(p_token uuid, p_respostas jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare ac public.repo_acessos; s public.repo_sessoes; a public.teste_aplicacoes;
        r public.teste_respostas; v_auto jsonb; v_abertas boolean;
begin
  select * into ac from repo_acessos where token = p_token;
  if ac.id is null then return json_build_object('ok', false); end if;
  select * into s from repo_sessoes where id = ac.sessao_id;
  select * into a from teste_aplicacoes where sessao_id = s.id or sessao_nota_id = s.id limit 1;
  if a.id is null or a.fechado then return json_build_object('ok', false, 'erro', 'FECHADO'); end if;

  select * into r from teste_respostas where aplicacao_id = a.id and user_id = ac.user_id;
  if r.id is null then return json_build_object('ok', false); end if;
  if r.submetido_em is not null then return json_build_object('ok', true, 'ja', true); end if;

  v_auto := _teste_auto(a.itens, coalesce(p_respostas, r.respostas));
  v_abertas := _teste_tem_abertas(a.itens);

  update teste_respostas
     set respostas = coalesce(p_respostas, respostas),
         pontos = v_auto,
         submetido_em = now(),
         nota = case when v_abertas then null else _teste_soma(v_auto) end,
         corrigido_em = case when v_abertas then null else now() end
   where id = r.id;
  return json_build_object('ok', true);
end $$;

revoke all on function public.teste_abrir(uuid) from public;
revoke all on function public.teste_guardar(uuid,jsonb) from public;
revoke all on function public.teste_submeter(uuid,jsonb) from public;
grant execute on function public.teste_abrir(uuid) to anon, authenticated;
grant execute on function public.teste_guardar(uuid,jsonb) to anon, authenticated;
grant execute on function public.teste_submeter(uuid,jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- A lista de sessões passa a dizer o tipo, para o Repo não mostrar as
-- sessões internas (badges e testes) ao lado dos avisos de material.
-- Aditivo: quem lê pelo nome das colunas não dá por nada.
-- ---------------------------------------------------------------------
drop function if exists public.repo_sessoes_listar(uuid, uuid);
create or replace function public.repo_sessoes_listar(p_token uuid, p_repo_turma_id uuid)
returns table(id uuid, titulo text, texto text, link text, modulo text,
              criado_em timestamptz, enviado_em timestamptz,
              assunto text, cabecalho text, saudacao text, botao text, rodape text,
              destinatarios bigint, enviados bigint, abriram bigint, tipo text)
language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return query
    select s.id, s.titulo, s.texto, s.link, coalesce(s.modulo,''), s.criado_em, s.enviado_em,
           s.assunto, s.cabecalho, s.saudacao, s.botao, s.rodape,
           (select count(*) from repo_acessos a where a.sessao_id=s.id),
           (select count(*) from repo_acessos a where a.sessao_id=s.id and a.enviado_em is not null),
           (select count(*) from repo_acessos a where a.sessao_id=s.id and a.primeiro_clique is not null),
           coalesce(s.tipo,'sessao')
      from repo_sessoes s
     where s.repo_turma_id = p_repo_turma_id
     order by s.criado_em desc;
end $$;
grant execute on function public.repo_sessoes_listar(uuid,uuid) to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Conferir
-- ---------------------------------------------------------------------
--   select public.teste_abrir('00000000-0000-0000-0000-000000000000');  -> null
--   select count(*) from public.testes;
