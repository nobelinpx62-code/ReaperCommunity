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
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET || "fallback-secret-for-reaper-community-12345",
  debug: true,
  trustHost: true,
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
        session.user.agreedTerms = user.agreedTerms;
        session.user.verifiedToken = user.verifiedToken;

        const account = await prisma.account.findFirst({
           where: { userId: user.id, provider: "discord" }
        });
        session.user.discordId = account?.providerAccountId;
      }
      return session;
    },
  },
})
