import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true, // Ativa logs detalhados na Vercel para sabermos o erro exato
  providers: [
    Discord({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        checks: ["state"], 
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        if (!user?.email) return false;

        const discordId = account?.providerAccountId;
        const isAdmin = discordId && ADMIN_IDS.includes(discordId);

        // Busca se o usuário já existe
        const { data: existingUser, error: fetchError } = await supabase
          .from('User')
          .select('id, role, agreedTerms')
          .eq('email', user.email)
          .maybeSingle(); // maybeSingle é mais seguro que single()

        if (fetchError) {
          console.error("Erro ao buscar usuário no Supabase:", fetchError);
        }

        if (!existingUser) {
          const newUserId = user.id || crypto.randomUUID();
          const { error: insertError } = await supabase.from('User').insert({
            id: newUserId,
            name: profile?.global_name || profile?.username || user.name,
            email: user.email,
            image: user.image,
            role: isAdmin ? 'ADMIN' : 'USER',
            agreedTerms: isAdmin ? true : false,
            updatedAt: new Date().toISOString()
          });
          
          if (insertError) {
            console.error("Erro ao inserir novo usuário:", insertError);
          }
          user.id = newUserId;
        } else {
          user.id = existingUser.id;
          if (isAdmin && (!existingUser.agreedTerms || existingUser.role !== 'ADMIN')) {
            await supabase.from('User')
              .update({ role: 'ADMIN', agreedTerms: true })
              .eq('id', existingUser.id);
          }
        }

        // Sincroniza a conta do Discord
        if (account && user.id) {
           const { data: existingAccount } = await supabase
              .from('Account')
              .select('id')
              .eq('providerAccountId', account.providerAccountId)
              .maybeSingle();

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
      } catch (err) {
        console.error("Erro fatal no signIn callback:", err);
        return true; // Deixa o login prosseguir mesmo se o sync falhar, para não travar o usuário
      }
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.agreedTerms = (user as any).agreedTerms ?? false;
        token.role = (user as any).role ?? 'USER';
      }

      if (token.id) {
        try {
          const { data, error } = await supabase
            .from('User')
            .select('agreedTerms, role')
            .eq('id', token.id)
            .maybeSingle();
          
          if (!error && data) {
            token.agreedTerms = data.agreedTerms ?? false;
            token.role = data.role ?? 'USER';
          }
        } catch (e) {
            console.error("Erro ao atualizar JWT do Supabase:", e);
        }
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
        session.user.role = token.role;
      }
      return session;
    },
  },
})
