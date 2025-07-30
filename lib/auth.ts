import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials", // This ID must match the frontend call
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- Authorize function started ---"); // We need to see this log

        if (!credentials?.email || !credentials?.password) {
          console.log("Error: Missing credentials.");
          throw new Error("Invalid credentials");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          console.log("Error: User not found.");
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          console.log("Error: Password comparison failed.");
          throw new Error("Invalid credentials");
        }
        
        console.log("--- Authorize successful! ---");
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.image = dbUser.image;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};