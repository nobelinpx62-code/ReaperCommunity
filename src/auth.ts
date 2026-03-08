import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        checks: ["state"], // Desliga o PKCE que está quebrando nos seus links de preview
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (!user?.email) return false;

      // Sincroniza o usuário direto no Supabase sem erro de Prisma
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        await supabase.from('User').insert({
          id: user.id || crypto.randomUUID(),
          name: profile?.global_name || user.name,
          email: user.email,
          image: user.image,
          role: 'USER',
          updatedAt: new Date().toISOString()
        });
      }

      // Sincroniza a conta do Discord
      if (account && user.id) {
         const { data: existingAccount } = await supabase
            .from('Account')
            .select('id')
            .eq('providerAccountId', account.providerAccountId)
            .single();

         if (!existingAccount) {
            await supabase.from('Account').insert({
               id: crypto.randomUUID(),
               userId: user.id,
               type: account.type,
               provider: account.provider,
               providerAccountId: account.providerAccountId,
               access_token: account.access_token,
               token_type: account.token_type,
               scope: account.scope,
               updatedAt: new Date().toISOString()
            });
         }
      }
      return true;
    },
    async jwt({ token, user, account } : any) {
      if (user) {
        token.id = user.id;
        token.agreedTerms = (user as any).agreedTerms || false;
      }
      if (account) {
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.discordId = token.discordId;
        session.user.agreedTerms = token.agreedTerms;
      }
      return session;
    },
  },
})
