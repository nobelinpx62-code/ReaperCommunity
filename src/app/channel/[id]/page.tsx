import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LoginGate from "@/components/LoginGate"
import TermsGate from "@/components/TermsGate"
import TokenGate from "@/components/TokenGate"
import Post from "@/components/Post"
import CreatePost from "@/components/CreatePost"
import Link from "next/link"
import { ArrowLeft, Hash } from "lucide-react"
import RealtimeSync from "@/components/RealtimeSync"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export default async function ChannelPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ view?: string }> }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return <LoginGate />;

  const user = session.user;
  const resolvedSearchParams = await searchParams;
  const isMemberView = resolvedSearchParams?.view === "member";
  
  const discordId = user.user_metadata?.provider_id || user.id
  const isRealAdmin = ADMIN_IDS.includes(discordId);
  const isAdmin = isRealAdmin && !isMemberView;

  const { data: dbUser } = await supabase.from('User').select('*').eq('discord_id', discordId).maybeSingle()
  
  if (!dbUser?.agreed_terms && !isRealAdmin) return <TermsGate />;
  // TokenGate can be added here if needed

  const resolvedParams = await params;

  // Busca o canal e seus posts usando Supabase (Snake Case)
  const { data: channelData } = await supabase
    .from('Channel')
    .select('*, Category(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (!channelData) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Canal não encontrado.</div>;

  // Busca os posts com relações
  const { data: postsData = [] } = await supabase
    .from('Post')
    .select(`
        *,
        User(*),
        Like(*),
        Comment(*, User(*)),
        Rating(*)
    `)
    .eq('channel_id', resolvedParams.id)
    .order('created_at', { ascending: false });

  return (
    <main className="app-container animate-fade-in" style={{ paddingBottom: '100px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '900px' }}>
      <div className="feed-container">
        
        <div style={{ marginBottom: '24px' }}>
          <Link href={`/${isMemberView ? '?view=member' : ''}`} className="back-link">
             <ArrowLeft size={18} /> Voltar para o Início
          </Link>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ padding: '16px', background: 'rgba(138, 31, 36, 0.1)', borderRadius: '12px' }}>
               <Hash size={40} color="var(--accent-red)" />
             </div>
             <div>
                <p style={{ color: 'var(--accent-purple-light)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{channelData.Category?.name}</p>
                <h1 className="brand-font" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', margin: 0 }}>{channelData.name}</h1>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            {(postsData || []).map((post: any) => {
              const mappedPost = {
                id: post.id,
                author: {
                   name: post.User?.name || post.owner_name || "Reaper Admin",
                   handle: post.User?.role || "admin",
                   avatar: post.User?.avatar_url || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop"
                },
                title: post.title,
                content: post.content,
                banner: post.banner,
                video: post.video_url,
                ownerName: post.owner_name,
                externalLink: post.external_link,
                fileUrl: post.file_url,
                imageSize: post.image_size,
                isSpoiler: post.is_spoiler,
                likes: (post.Like || []).length,
                hasLiked: (post.Like || []).some((l: any) => l.user_id === user.id),
                comments: (post.Comment || []).map((c: any) => ({
                    id: c.id,
                    text: c.text,
                    authorName: c.User?.name || "Membro",
                    authorAvatar: c.User?.avatar_url || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop",
                    timestamp: new Date(c.created_at).toLocaleDateString('pt-BR')
                })),
                ratings: (post.Rating || []).map((r: any) => r.stars),
                userRating: (post.Rating || []).find((r: any) => r.user_id === user.id)?.stars || 0,
                timestamp: new Date(post.created_at).toLocaleDateString('pt-BR')
              };
              return <Post key={mappedPost.id} post={mappedPost} channelId={channelData.id} isAdmin={isAdmin} />
            })}
            
            {(!postsData || postsData.length === 0) && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum conteúdo postado neste canal ainda.</p>
            )}
        </div>
        
        {isAdmin ? (
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                <CreatePost user={user} channelId={channelData.id} />
            </div>
        ) : (
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(138, 31, 36, 0.4)', background: 'rgba(138, 31, 36, 0.05)', marginTop: '32px' }}>
               <h3 className="brand-font" style={{ color: 'var(--accent-red)', marginBottom: '8px', fontSize: '1.4rem' }}>LEITURA DE CANAL</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Apenas administradores podem postar aqui.</p>
            </div>
        )}
        
        {!isRealAdmin && <RealtimeSync />}
      </div>
    </main>
  );
}
