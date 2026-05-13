import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from './supabase';

function getBaseUrl(): string {
  // In production, use NEXTAUTH_URL if explicitly set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Use NEXT_PUBLIC_APP_URL as fallback (preferred)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Should not reach here in production
  throw new Error('NEXTAUTH_URL or NEXT_PUBLIC_APP_URL must be set in production');
}

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
      // Ensure redirects use the proper base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      // Default to home
      return baseUrl;
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
