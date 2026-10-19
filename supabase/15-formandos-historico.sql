-- =====================================================================
--  CRM - FORMANDOS: HISTÓRICO DE CADA PESSOA
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase, DEPOIS do 14. É idempotente.
--
--  1. A lista dos formandos passa a trazer, por pessoa, quantas campanhas
--     recebeu e em quantas clicou (a coluna "Campanhas" da lista).
--  2. formando_historico: as campanhas que a pessoa recebeu, em que
--     formação clicou, se saiu ou se o email foi devolvido - a linha do
--     tempo da ficha.
--  3. formando_formacao_tirar: tirar uma formação a uma pessoa (uma
--     ligação errada); a formação continua lá para os outros.
-- =====================================================================

create or replace function public.formandos_listar(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return json_build_object(
    'formandos', coalesce((
      select json_agg(json_build_object(
               'id', f.id, 'nome', f.nome, 'apelido', f.apelido, 'email', f.email,
               'notas', f.notas, 'criado_em', f.criado_em, 'saiu_em', f.saiu_em,
               'devolvido_em', f.devolvido_em, 'devolvido_motivo', f.devolvido_motivo,
               'campanhas', (select count(*) from campanha_envios e where e.formando_id = f.id and e.estado = 'enviado'),
               'clicou',    (select count(*) from campanha_envios e where e.formando_id = f.id and e.cliques > 0),
               'formacoes', coalesce((
                 select json_agg(json_build_object(
                          'id', c.id, 'curso', c.curso, 'entidade', c.entidade,
                          'inicio', c.inicio, 'fim', c.fim)
                        order by c.inicio desc nulls last, c.curso)
                   from formando_formacoes ff
                   join formacoes c on c.id = ff.formacao_id
                  where ff.formando_id = f.id), '[]'::json))
             order by lower(f.nome), lower(f.apelido))
        from formandos f), '[]'::json),
    'distintos', coalesce((select json_agg(json_build_array(d.a, d.b)) from formandos_distintos d), '[]'::json)
  );
end $$;

create or replace function public.formando_historico(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  return coalesce((
    select json_agg(json_build_object(
             'campanha_id', c.id, 'assunto', c.assunto, 'estado', e.estado,
             'enviado_em', e.enviado_em, 'cliques', e.cliques, 'cliques_botoes', e.cliques_botoes,
             'formacoes', coalesce((select json_agg(x->>'titulo')
                                      from jsonb_array_elements(coalesce(c.conteudo->'formacoes', '[]'::jsonb)) x), '[]'::json),
             'saiu_em', e.saiu_em, 'devolvido_em', e.devolvido_em, 'devolvido_motivo', e.devolvido_motivo)
           order by coalesce(e.enviado_em, c.criada_em) desc)
      from campanha_envios e join campanhas c on c.id = e.campanha_id
     where e.formando_id = p_id), '[]'::json);
end $$;

create or replace function public.formando_formacao_tirar(p_token uuid, p_formando uuid, p_formacao uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform _repo_root(p_token);
  delete from formando_formacoes where formando_id = p_formando and formacao_id = p_formacao;
  if not found then raise exception 'NAO_ENCONTRADO'; end if;
  return json_build_object('ok', true);
end $$;

revoke all on function public.formando_historico(uuid, uuid) from public, anon;
revoke all on function public.formando_formacao_tirar(uuid, uuid, uuid) from public, anon;
grant execute on function public.formandos_listar(uuid) to anon, authenticated;
grant execute on function public.formando_historico(uuid, uuid) to anon, authenticated;
grant execute on function public.formando_formacao_tirar(uuid, uuid, uuid) to anon, authenticated;
