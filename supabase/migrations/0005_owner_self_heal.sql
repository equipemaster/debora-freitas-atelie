-- =============================================================================
-- Corrige um caso real que aconteceu em dev: um usuário de teste foi criado
-- (virou owner, criou a organização) e depois apagado. `profiles` tem
-- `on delete cascade` para `auth.users`, então o perfil sumiu junto — mas
-- `organizations` não tem FK de volta, então a organização ficou órfã, sem
-- ninguém com role 'owner'. O próximo usuário a entrar virava 'assistant'
-- (regra antiga: role só depende de já existir organização).
--
-- Nova regra: role owner é readquirido por quem entrar se a organização
-- existente não tiver NENHUM owner ainda — não só quando ela não existe.
-- Autocura o cenário acima sem precisar de UPDATE manual.
-- =============================================================================
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org_id    uuid;
  v_has_owner boolean;
  v_role      user_role;
begin
  select id into v_org_id from organizations order by created_at asc limit 1;

  if v_org_id is null then
    insert into organizations (name) values ('Débora Freitas Ateliê')
      returning id into v_org_id;
    v_role := 'owner';
  else
    select exists (
      select 1 from profiles where org_id = v_org_id and role = 'owner'
    ) into v_has_owner;
    v_role := case when v_has_owner then 'assistant' else 'owner' end;
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
