-- Funções de trigger não devem ser chamáveis via RPC pública — só disparam
-- pelo próprio gatilho, nunca por /rest/v1/rpc/*. Achado pelo linter de
-- segurança do Supabase (get_advisors) logo após 0003_auth_bootstrap.
revoke execute on function handle_new_auth_user() from public, anon, authenticated;
revoke execute on function guard_profile_self_update() from public, anon, authenticated;
