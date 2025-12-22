import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Jika user belum login, lempar ke sini
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      // Kita biarkan middleware.ts yang menangani redirect agar lebih aman
      // Di sini kita return true agar tidak ada konflik logic
      return true; 
    },
    jwt({ token, user }) {
      if (user) {
        // @ts-ignore - Kita akan perbaiki tipe ini nanti
        token.role = user.role; 
        // @ts-ignore
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.role = token.role; 
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [], // Wajib kosong di sini untuk kompatibilitas Middleware
} satisfies NextAuthConfig;