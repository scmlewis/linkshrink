import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from './supabase';

export const authOptions: NextAuthConfig = {
  trustHost: true,
  basePath: '/api/auth',

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : null;

        if (!email) {
          console.error('[Auth] No email provided');
          return null;
        }

        try {
          console.log('[Auth] Attempting login for:', email);
          
          // Try to get existing user
          const { data: users, error: queryError } = await supabaseAdmin
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .limit(1);

          if (queryError) {
            console.error('[Auth] Query error:', queryError.message);
            return null;
          }

          if (users && users.length > 0) {
            console.log('[Auth] User found:', users[0].id);
            return {
              id: users[0].id,
              email: users[0].email,
              name: users[0].name,
            };
          }

          // Create new user
          console.log('[Auth] Creating new user:', email);
          const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              email,
              name: email.split('@')[0],
            })
            .select('id, email, name')
            .single();

          if (insertError || !newUser) {
            console.error('[Auth] Insert error:', insertError?.message);
            return null;
          }

          console.log('[Auth] User created:', newUser.id);
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        } catch (error) {
          console.error('[Auth] Unexpected error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Priority order for determining app URL:
      // 1. NEXTAUTH_URL (most reliable in production)
      // 2. NEXT_PUBLIC_APP_URL (fallback)
      // 3. NEXT_PUBLIC_SHORT_URL_BASE (alternative fallback)
      // 4. baseUrl from request (last resort)
      const appUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_SHORT_URL_BASE ||
        baseUrl;

      // Only allow relative URLs or URLs to the configured app URL
      if (url.startsWith('/')) return `${appUrl}${url}`;
      if (url.startsWith(appUrl)) return url;

      // Security: reject redirects to other domains
      return appUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === 'development' ? 'linkshrink-dev-secret' : undefined),
};

export const { handlers, auth } = NextAuth(authOptions);
