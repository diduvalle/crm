-- =====================================================================
--  CRM - A DATA DO CONVITE VOLTA À LISTA DA TURMA
-- =====================================================================
--  Correr uma vez no SQL Editor do Supabase. É idempotente.
--
--  O problema: na lista de utilizadores da turma, a coluna CONVITE dizia
--  "Por enviar" mesmo depois de os convites saírem. O envio marca bem
--  (marcar_convite escreve utilizadores.convite_em), mas em agosto, quando
--  entrou o limite de entregas (migration-limite-envios.sql), a função
--  listar_utilizadores foi reescrita SEM a coluna convite_em - e a lista
--  nunca mais a recebeu.
--
--  Isto devolve a coluna e mantém tudo o que o limite de entregas trouxe.
--  As marcas que já existem aparecem logo: nunca deixaram de ser gravadas.
--  Serve o crm.cr0x.org e o iefpcrm.cr0x.org (o mesmo projeto Supabase).
-- =====================================================================

alter table public.utilizadores add column if not exists convite_em timestamptz;

-- largar primeiro: o tipo de retorno muda (senão dá o erro 42P13)
drop function if exists public.listar_utilizadores(uuid);
create or replace function public.listar_utilizadores(p_token uuid)
returns table(id uuid, username text, nome text, apelido text,
              email text, email2 text, papel text, criado_em timestamptz,
              convite_em timestamptz,
              limite int, envios int, limite_proprio int, limite_turma int)
language plpgsql security definer set search_path = public as $$
declare caller public.utilizadores;
begin
  select * into caller from _user_from_token(p_token);
  if caller.id is null then raise exception 'SESSAO_INVALIDA'; end if;
  return query
    select u.id, u.username, u.nome, u.apelido, u.email, u.email2, u.papel, u.criado_em,
           u.convite_em,
           coalesce(u.limite_envios, t.limite_envios, 2)::int as limite,
           (select count(*) from submissoes s where s.user_id = u.id)::int as envios,
           u.limite_envios as limite_proprio,
           coalesce(t.limite_envios, 2)::int as limite_turma
    from utilizadores u
    join turmas t on t.id = u.turma_id
    where u.turma_id = caller.turma_id
    order by case u.papel when 'Administrador' then 0 when 'Formador' then 1 else 2 end, u.nome;
end $$;

grant execute on function public.listar_utilizadores(uuid) to anon, authenticated;
