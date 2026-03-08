import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
        clientId: process.env.DISCORD_CLIENT_ID || "demo-client-id",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "demo-client-secret",
    }),
  ],
  session: { strategy: "jwt" }, // MUDADO: JWT é muito mais estável na Vercel
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, user, account } : any) {
      if (user) {
        token.id = user.id;
        token.agreedTerms = (user as any).agreedTerms;
        token.verifiedToken = (user as any).verifiedToken;
      }
      if (account) {
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.agreedTerms = token.agreedTerms;
        session.user.verifiedToken = token.verifiedToken;
        session.user.discordId = token.discordId;
      }
      return session;
    },
  },
})
