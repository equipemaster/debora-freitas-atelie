-- =============================================================================
-- Endurecimento de segurança apontado pelo linter do Supabase (get_advisors)
-- =============================================================================

-- search_path mutável em função SECURITY DEFINER-adjacent: fixar search_path
-- evita que alguém explore um schema temporário para sequestrar a função.
create or replace function touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- auth_org_ids() e auth_has_role() só precisam ser chamadas de dentro das
-- policies de RLS (papel `authenticated`), não como RPC pública. Revoga de
-- `public`/`anon` e mantém só para `authenticated`.
revoke execute on function auth_org_ids() from public, anon;
revoke execute on function auth_has_role(user_role[]) from public, anon;
grant  execute on function auth_org_ids() to authenticated;
grant  execute on function auth_has_role(user_role[]) to authenticated;
