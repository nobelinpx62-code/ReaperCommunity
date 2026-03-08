import { auth } from "@/auth"
import LoginGate from "@/components/LoginGate"
import TermsGate from "@/components/TermsGate"
import TokenGate from "@/components/TokenGate"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Hash, Plus, Trash2, ShieldCheck } from "lucide-react"
import { createCategory, createChannel, deleteCategory, deleteChannel } from "@/app/actions/adminActions"
import RealtimeSync from "@/components/RealtimeSync"
import TicketPanel from "@/components/TicketPanel"
import AdminPanel from "@/components/AdminPanel"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export default async function Home(props: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth()

  if (!session) return <LoginGate />;

  const user = session.user as any;
  const searchParams = await props.searchParams;
  const isMemberView = searchParams?.view === "member";
  const isRealAdmin = ADMIN_IDS.includes(user?.discordId);
  const isAdmin = isRealAdmin && !isMemberView;

  if (!user.agreedTerms) return <TermsGate />;
  if (!isAdmin && !user.verifiedToken) return <TokenGate />;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const isStaff = isRealAdmin || dbUser?.role === "STAFF" || dbUser?.role === "ADMIN";
  const activeStaffMode = isStaff && !isMemberView;

  const tickets = await prisma.ticket.findMany({
      where: activeStaffMode ? {} : { userId: user.id },
      include: {
          user: true,
          messages: { include: { user: true }, orderBy: { createdAt: 'asc' } }
      },
      orderBy: [ { status: 'desc' }, { createdAt: 'desc' } ]
  });

  const allUsers = isAdmin ? await prisma.user.findMany({ include: { accounts: true }, orderBy: { createdAt: 'desc' } }) : [];

  let categories = await prisma.category.findMany({
    include: { channels: true },
    orderBy: { createdAt: 'asc' }
  });

  // Seed default category if none exist
  if (categories.length === 0 && isAdmin) {
    await prisma.category.create({
      data: {
        name: "Sistemas RBX",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roblox_Logo_2022.svg/100px-Roblox_Logo_2022.svg.png",
        channels: {
          create: [{ name: "anúncios-rbx" }, { name: "downloads" }]
        }
      }
    });
    categories = await prisma.category.findMany({ include: { channels: true }, orderBy: { createdAt: 'asc' } });
  }

  return (
    <main className="app-container animate-fade-in" style={{ paddingBottom: '100px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '900px' }}>
      <div className="feed-container">
        
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center', position: 'relative' }}>
          <h2 className="brand-font text-gradient-purple" style={{ marginBottom: '12px', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            BEM VINDO, {user?.name?.toUpperCase() ?? "USUÁRIO"}
            {isRealAdmin && <span title="Verified Admin Root"><ShieldCheck color="#00ff00" size={28} /></span>}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: isRealAdmin ? '24px' : '0' }}>
            Servidor root de Arquivos. Selecione um canal da comunidade abaixo para acessar seu conteúdo.
          </p>

          {isRealAdmin && (
             <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link href="/" className={!isMemberView ? "btn-primary" : "btn-secondary"} style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>
                    Modo Root (Painel)
                </Link>
                <Link href="/?view=member" className={isMemberView ? "btn-primary" : "btn-secondary"} style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>
                    Visualização Modo Membro
                </Link>
             </div>
          )}
         </div>

         {isAdmin && <AdminPanel users={allUsers} isRealAdmin={isAdmin} />}
         <TicketPanel user={{...user, role: dbUser?.role || "USER"}} tickets={tickets} isStaff={activeStaffMode} />

         {isAdmin && (
          <form action={async (formData) => {
            "use server";
            const name = formData.get("name") as string;
            const icon = formData.get("icon") as string;
            if(name) await createCategory(name, icon);
          }} className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" name="name" placeholder="Nova Categoria..." className="input-field" required style={{ flex: 1 }} />
            <input type="text" name="icon" placeholder="URL Ícone (Opcional)" className="input-field" style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}><Plus size={18} /> CRIAR</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map(cat => (
            <div key={cat.id} className="glass-panel" style={{ padding: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                 <h3 className="brand-font text-gradient-red" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   {cat.icon && <img src={cat.icon} alt={cat.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />}
                   {cat.name.toUpperCase()}
                 </h3>
                 {isAdmin && (
                    <form action={async () => { "use server"; await deleteCategory(cat.id); }}>
                       <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={18}/></button>
                    </form>
                 )}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                 {cat.channels.map(ch => (
                    <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link href={`/channel/${ch.id}${isMemberView ? '?view=member' : ''}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <div className="channel-card">
                          <Hash color="var(--text-muted)" size={20} />
                          <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{ch.name}</span>
                        </div>
                      </Link>
                      {isAdmin && (
                         <form action={async () => { "use server"; await deleteChannel(ch.id); }} style={{ marginLeft: '12px' }}>
                            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}><Trash2 size={16}/></button>
                         </form>
                      )}
                    </div>
                 ))}

                 {isAdmin && (
                    <form action={async (formData) => {
                      "use server";
                      const name = formData.get("name") as string;
                      if(name) await createChannel(cat.id, name);
                    }} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input type="text" name="name" placeholder="novo-canal" className="input-field" required style={{ flex: 1, padding: '10px' }} />
                      <button type="submit" className="btn-secondary" style={{ padding: '0 16px' }}><Plus size={16}/></button>
                    </form>
                 )}
               </div>
            </div>
          ))}
          {categories.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma categoria disponível.</p>}
        </div>

        {!isAdmin && <RealtimeSync />}
      </div>
    </main>
  );
}
