-- =============================================================================
-- Bootstrap de autenticação + correção de um gap de RLS em `profiles`.
-- =============================================================================

-- ---------- bootstrap: cria organização/perfil no primeiro login -----------
-- Projeto Supabase é dedicado só a este ateliê (decisão registrada no
-- CLAUDE.md seção 11: multi-organização fica para depois). Então:
--   * primeiro usuário a se autenticar          -> cria a organização, role 'owner'
--   * demais usuários (equipe convidada depois) -> entram na organização já
--     existente, role 'assistant' (a dona do ateliê promove quem precisar
--     depois, pela tela de Marca/Equipe — RLS abaixo já permite isso).
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org_id uuid;
  v_role   user_role;
begin
  select id into v_org_id from organizations order by created_at asc limit 1;

  if v_org_id is null then
    insert into organizations (name) values ('Débora Freitas Ateliê')
      returning id into v_org_id;
    v_role := 'owner';
  else
    v_role := 'assistant';
  end if;

  insert into profiles (id, org_id, full_name, role)
  values (
    new.id,
    v_org_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_role
  )
  on conflict (id) do nothing;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ---------- corrige RLS de profiles -----------------------------------------
-- `profiles_self_update` (0001) só filtra `id = auth.uid()` e não tem WITH
-- CHECK próprio — nesse caso o Postgres reusa a USING como WITH CHECK, o que
-- restringe QUAL LINHA pode ser alterada, mas não QUAIS COLUNAS. Ou seja,
-- qualquer pessoa logada podia fazer UPDATE profiles SET role = 'owner' no
-- próprio registro. Corrige com um trigger que bloqueia troca de
-- role/org_id por quem não é 'owner', e adiciona a policy que faltava para
-- a dona do ateliê (role owner) gerenciar a equipe de verdade.
create or replace function guard_profile_self_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.id = auth.uid()
     and not auth_has_role(array['owner']::user_role[])
     and (new.role is distinct from old.role or new.org_id is distinct from old.org_id)
  then
    raise exception 'Você não pode alterar seu próprio papel ou organização.';
  end if;
  return new;
end $$;

create trigger profiles_guard_self_update
  before update on profiles
  for each row execute function guard_profile_self_update();

create policy profiles_owner_manage on profiles for update
  using (org_id in (select auth_org_ids()) and auth_has_role(array['owner']::user_role[]))
  with check (org_id in (select auth_org_ids()) and auth_has_role(array['owner']::user_role[]));
