import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LoginGate from "@/components/LoginGate"
import TermsGate from "@/components/TermsGate"
import TokenGate from "@/components/TokenGate"
import Link from "next/link"
import { Hash, Plus, Trash2, ShieldCheck, AlertCircle } from "lucide-react"
import RealtimeSync from "@/components/RealtimeSync"
import TicketPanel from "@/components/TicketPanel"
import AdminPanel from "@/components/AdminPanel"
import { createCategoryAction, deleteCategoryAction, createChannelAction, deleteChannelAction } from "@/app/actions/adminActions"

export const dynamic = 'force-dynamic'

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export default async function Home(props: { searchParams: Promise<{ view?: string }> }) {
  const supabase = createServerComponentClient({ cookies })
  
  // PEGANDO SESSÃO PELO SUPABASE
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return <LoginGate />

  const user = session.user
  const searchParams = await props.searchParams
  const isMemberView = searchParams?.view === "member"
  
  // Identificação Robusta (Discord ID vem no user_metadata do Supabase)
  const discordId = user.user_metadata?.provider_id || user.id
  const isRealAdmin = ADMIN_IDS.includes(discordId)
  const isAdmin = isRealAdmin && !isMemberView

  // Busca dados extras na tabela User (opcional)
  const { data: dbUser } = await supabase.from('User').select('*').eq('discord_id', discordId).maybeSingle()
  
  // Se for admin, pula travas
  if (!dbUser?.agreed_terms && !isRealAdmin) return <TermsGate />
  
  const isStaff = isRealAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN"
  const activeStaffMode = isStaff && !isMemberView

  // Busca Categorias e Canais
  const { data: categoriesData, error: catError } = await supabase
    .from('Category')
    .select('*, channels:Channel(*)')
    .order('created_at', { ascending: true })

  const categories = categoriesData || []

  // Tickets
  const { data: ticketsData } = await supabase
    .from('Ticket')
    .select('*, User(*), TicketMessage(*, User(*))')
    .order('created_at', { ascending: false })

  let allUsers = []
  if (isAdmin) {
    const { data: usersData } = await supabase.from('User').select('*').order('created_at', { ascending: false })
    allUsers = usersData || []
  }

  return (
    <main className="app-container animate-fade-in" style={{ paddingBottom: '100px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '900px' }}>
      <div className="feed-container">
        
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center', position: 'relative' }}>
          <h2 className="brand-font text-gradient-purple" style={{ marginBottom: '12px', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            BEM VINDO, {user.user_metadata?.full_name?.toUpperCase() ?? "USUÁRIO"}
            {isRealAdmin && <span title="Verified Admin Root"><ShieldCheck color="#00ff00" size={28} /></span>}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: isRealAdmin ? '24px' : '0' }}>
            Servidor root de Arquivos (MODO SUPABASE PURO).
          </p>

          {isRealAdmin && (
             <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link href="/" className={!isMemberView ? "btn-primary" : "btn-secondary"} style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>Modo Root</Link>
                <Link href="/?view=member" className={isMemberView ? "btn-primary" : "btn-secondary"} style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>Modo Membro</Link>
             </div>
          )}
         </div>

         {catError && (
             <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', border: '1px solid var(--accent-red)' }}>
                <AlertCircle color="var(--accent-red)" />
                <p style={{ color: 'var(--accent-red)' }}>Supabase Error: {catError.message}. Recarregue a página.</p>
             </div>
         )}

         {isAdmin && <AdminPanel users={allUsers} isRealAdmin={isAdmin} />}

         {isAdmin && (
          <form action={createCategoryAction} className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" name="name" placeholder="Nova Categoria..." className="input-field" required style={{ flex: 1 }} />
            <input type="text" name="icon" placeholder="Icon URL" className="input-field" style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}><Plus size={18} /> CRIAR</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map((cat: any) => (
            <div key={cat.id} className="glass-panel" style={{ padding: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <h3 className="brand-font text-gradient-red" style={{ fontSize: '1.5rem' }}>
                   {cat.name.toUpperCase()}
                 </h3>
                 {isAdmin && (
                    <form action={async () => { "use server"; await deleteCategoryAction(cat.id); }}>
                       <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}><Trash2 size={18}/></button>
                    </form>
                 )}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {(cat.channels || []).map((ch: any) => (
                    <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link href={`/channel/${ch.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <div className="channel-card">
                          <Hash color="var(--text-muted)" size={20} />
                          <span style={{ fontSize: '1.2rem' }}>{ch.name}</span>
                        </div>
                      </Link>
                      {isAdmin && (
                         <form action={async () => { "use server"; await deleteChannelAction(ch.id); }}>
                            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}><Trash2 size={16}/></button>
                         </form>
                      )}
                    </div>
                 ))}

                 {isAdmin && (
                    <form action={createChannelAction} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input type="hidden" name="categoryId" value={cat.id} />
                      <input type="text" name="name" placeholder="novo-canal" className="input-field" required style={{ flex: 1 }} />
                      <button type="submit" className="btn-secondary" style={{ padding: '0 16px' }}><Plus size={16}/></button>
                    </form>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
