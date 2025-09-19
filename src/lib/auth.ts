import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * authOptions:
 * - Define o provider (neste caso, login com email/senha fixos — mock).
 * - Define as páginas customizadas ("/login").
 * - Define callbacks para salvar userId no token e session.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Usuária DEMO (mock). Em produção: BD + hash de senha.
        const demoUser = {
          id: "user_demo_1",
          name: "Usuária Demo",
          email: "demo@gran.com",
          password: "gran1234",
        };

        const ok =
          credentials.email === demoUser.email &&
          credentials.password === demoUser.password;

        return ok ? { id: demoUser.id, name: demoUser.name, email: demoUser.email } : null;
      },
    }),
  ],

  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).userId = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = (token as any).userId as string;
      return session;
    },
  },
};
