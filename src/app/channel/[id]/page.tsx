import { auth } from "@/auth"
import LoginGate from "@/components/LoginGate"
import TermsGate from "@/components/TermsGate"
import TokenGate from "@/components/TokenGate"
import Post from "@/components/Post"
import CreatePost from "@/components/CreatePost"
import Link from "next/link"
import { ArrowLeft, Hash } from "lucide-react"
import RealtimeSync from "@/components/RealtimeSync"
import { supabase } from "@/lib/supabase"

const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

export default async function ChannelPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ view?: string }> }) {
  const session = await auth()

  if (!session) return <LoginGate />;

  const user = session.user as any;
  const resolvedSearchParams = await searchParams;
  const isMemberView = resolvedSearchParams?.view === "member";
  const isRealAdmin = ADMIN_IDS.includes(user?.discordId);
  const isAdmin = isRealAdmin && !isMemberView;

  if (!user.agreedTerms && !isRealAdmin) return <TermsGate />;
  if (!isAdmin && !user.verifiedToken && !isRealAdmin) return <TokenGate />;

  const resolvedParams = await params;

  // Busca o canal e seus posts usando Supabase
  const { data: channelData } = await supabase
    .from('Channel')
    .select('*, category:Category(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (!channelData) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Canal não encontrado.</div>;

  // Busca os posts com relações
  const { data: postsData = [] } = await supabase
    .from('Post')
    .select(`
        *,
        author:User(*),
        likes:Like(*),
        comments:Comment(*, user:User(*)),
        ratings:Rating(*)
    `)
    .eq('channelId', resolvedParams.id)
    .order('createdAt', { ascending: false });

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
                <p style={{ color: 'var(--accent-purple-light)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{channelData.category.name}</p>
                <h1 className="brand-font" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', margin: 0 }}>{channelData.name}</h1>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            {(postsData || []).map((post: any) => {
              const mappedPost = {
                id: post.id,
                author: {
                   name: post.author.name || "Reaper Admin",
                   handle: "admin",
                   avatar: post.author.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop"
                },
                title: post.title,
                content: post.content,
                banner: post.banner,
                video: post.video,
                ownerName: post.ownerName,
                externalLink: post.externalLink,
                fileUrl: post.fileUrl,
                imageSize: post.imageSize,
                isSpoiler: post.isSpoiler,
                likes: post.likes.length,
                hasLiked: post.likes.some((l: any) => l.userId === user.id),
                comments: post.comments.map((c: any) => ({
                    id: c.id,
                    text: c.text,
                    authorName: c.user.name || "Membro",
                    authorAvatar: c.user.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop",
                    timestamp: new Date(c.createdAt).toLocaleDateString('pt-BR')
                })),
                ratings: post.ratings.map((r: any) => r.stars),
                userRating: post.ratings.find((r: any) => r.userId === user.id)?.stars || 0,
                timestamp: new Date(post.createdAt).toLocaleDateString('pt-BR')
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
