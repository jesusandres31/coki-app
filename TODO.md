# Next steps: Google sign-in with existing users only

- Keep password login enabled so existing users with fictitious emails can still sign in.
- Configure PocketBase Google OAuth2 provider with the Google Client ID and Client Secret.
- Lock public user creation in PocketBase (`users` create rule disabled/admin-only) to prevent Google sign-up.
- Create/update users manually: fictitious emails for password-only users, real Google emails for OAuth users.
- Configure Google Cloud OAuth consent screen and Web OAuth Client redirect URIs.
- Implement frontend only with the official PocketBase SDK:
  - password login flow
  - Google OAuth code flow
  - auth refresh on app startup/session restore
  - logout and failed-login handling
