import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

// baseURL defaults to window.location.origin.
// Vite proxy forwards /api/* → http://localhost:3000, so auth routes at
// /api/auth/* are transparently handled in dev without CORS issues.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { useSession, signIn, signOut } = authClient;
