import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { validateCredentials, findOrCreateGoogleUser, getUserForSession } from '@/services/authService';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {},
  providers: [
    CredentialsProvider({
      id: 'credentials', name: 'Email & Password',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error('Email and password are required.');
        const user = await validateCredentials(credentials.email, credentials.password);
        if (!user) throw new Error('Invalid email or password.');
        return { id: user.id, name: user.name, email: user.email, role: user.role as never, initials: user.initials, avatarBg: user.avatarBg, avatarColor: user.avatarColor };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') return true;
      if (account?.provider === 'google') {
        try {
          const email = profile?.email ?? user.email;
          const name = profile?.name ?? user.name ?? email ?? 'User';
          if (!email) return false;
          const dbUser = await findOrCreateGoogleUser(email, name);
          user.id = dbUser.id; user.role = dbUser.role as never;
          user.initials = dbUser.initials; user.avatarBg = dbUser.avatarBg; user.avatarColor = dbUser.avatarColor;
          return true;
        } catch { return false; }
      }
      return true;
    },
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id = user.id; token.role = (user as any).role;
        token.initials = (user as any).initials; token.avatarBg = (user as any).avatarBg; token.avatarColor = (user as any).avatarColor;
      }
      if (trigger === 'update' && sessionUpdate) {
        if (sessionUpdate.name) token.name = sessionUpdate.name;
        if (sessionUpdate.role) token.role = sessionUpdate.role;
      }
      const ONE_DAY = 60 * 60 * 24;
      const lastRefresh = (token.refreshedAt as number) ?? 0;
      const now = Math.floor(Date.now() / 1000);
      if (token.id && now - lastRefresh > ONE_DAY) {
        try {
          const freshUser = await getUserForSession(token.id as string);
          if (freshUser) { token.role = freshUser.role as never; token.name = freshUser.name; token.initials = freshUser.initials; token.avatarBg = freshUser.avatarBg; token.avatarColor = freshUser.avatarColor; }
        } catch {}
        token.refreshedAt = now;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string; session.user.role = token.role as never;
        session.user.initials = token.initials as string; session.user.avatarBg = token.avatarBg as string; session.user.avatarColor = token.avatarColor as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
