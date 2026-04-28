import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Tai khoan",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "sinhvien@example.com" },
        password: { label: "Mat khau", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) return null;

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First call after sign-in: copy fields from the authorized user.
      if (user) {
        token.role = user.role;
        token.id = user.id;
        return token;
      }

      // Subsequent calls: if the user no longer exists (e.g., DB was reseeded),
      // empty the token so NextAuth treats this session as unauthenticated.
      if (token.id) {
        const exists = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        });
        if (!exists) {
          return {};
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Empty token => signed-out session. Strip user so client treats as such.
      if (!token.id) {
        return { ...session, user: undefined } as typeof session;
      }
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "maux-secret-key-12345",
};
