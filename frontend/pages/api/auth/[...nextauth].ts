import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
            throw new Error("Invalid credentials");
        }

        let farmerId = user.farmerId || undefined;
        let processorId = user.processorId || undefined;
        let adminId = (user as any).adminId || undefined;

        if (user.role === 'FARMER' && !farmerId) {
          farmerId = `S2S-FRM-${user.id.slice(0, 6).toUpperCase()}`;
          await prisma.user.update({
            where: { id: user.id },
            data: { farmerId }
          }).catch(() => {});
        } else if (user.role === 'PROCESSOR' && !processorId) {
          processorId = `S2S-PRC-${user.id.slice(0, 6).toUpperCase()}`;
          await prisma.user.update({
            where: { id: user.id },
            data: { processorId }
          }).catch(() => {});
        } else if (user.role === 'ADMIN' && !adminId) {
          adminId = `S2S-ADM-${user.id.slice(0, 6).toUpperCase()}`;
          await prisma.user.update({
            where: { id: user.id },
            data: { adminId }
          }).catch(() => {});
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          farmerId,
          processorId,
          adminId,
          distributorId: (user as any).distributorId || undefined,
          retailerId: (user as any).retailerId || undefined,
          walletAddress: user.walletAddress,
          image: user.profilePhoto
        };
      }
    })
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.farmerId = (user as any).farmerId;
        token.processorId = (user as any).processorId;
        token.adminId = (user as any).adminId;
        token.distributorId = (user as any).distributorId;
        token.retailerId = (user as any).retailerId;
        token.walletAddress = user.walletAddress;
        token.picture = user.image || (user as any).profilePhoto;
      }
      
      // Handle wallet linking or photo updates
      if (trigger === "update" && session?.walletAddress !== undefined) {
        token.walletAddress = session.walletAddress;
      }
      if (trigger === "update" && session?.image !== undefined) {
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).farmerId = token.farmerId as string | undefined;
        (session.user as any).processorId = token.processorId as string | undefined;
        (session.user as any).adminId = token.adminId as string | undefined;
        (session.user as any).distributorId = token.distributorId as string | undefined;
        (session.user as any).retailerId = token.retailerId as string | undefined;
        session.user.walletAddress = token.walletAddress as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch (e) {}
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};

export default NextAuth(authOptions);
