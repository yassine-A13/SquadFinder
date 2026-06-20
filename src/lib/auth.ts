import { compare } from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsedCredentials = loginSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsedCredentials.data.email },
      });

      if (!user?.password) {
        return null;
      }

      const isValidPassword = await compare(
        parsedCredentials.data.password,
        user.password,
      );

      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "PLAYER";
      }

      if (!token.sub) {
        return token;
      }

      if (!token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });

        token.role = dbUser?.role ?? "PLAYER";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "PLAYER";
      }

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, profile: { select: { id: true } } },
        });

        if (existingUser && !existingUser.profile) {
          await prisma.profile.create({
            data: {
              userId: existingUser.id,
              city: null,
              age: null,
              gender: null,
              bio: null,
              availability: null,
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.profile.upsert({
        where: { userId: user.id! },
        update: {},
        create: {
          userId: user.id!,
          city: null,
          age: null,
          gender: null,
          bio: null,
          availability: null,
        },
      });
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
