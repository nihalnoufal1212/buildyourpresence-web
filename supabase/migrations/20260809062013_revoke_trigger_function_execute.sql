/*
# Harden trigger functions: revoke direct EXECUTE

The SECURITY DEFINER functions `handle_new_user` and `set_updated_at` are only
ever invoked by database triggers — they should not be callable directly via
the REST API (`/rest/v1/rpc/...`) by anon or authenticated users.

1. Revoke EXECUTE on both functions from anon and authenticated.
2. Grant EXECUTE only to the `postgres` / superuser role (trigger invocation
   does not require caller EXECUTE — triggers run with the function's privileges).
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
