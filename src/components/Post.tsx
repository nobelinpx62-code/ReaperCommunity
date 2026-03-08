"use client";

import { useState, useTransition } from "react";
import { Heart, MessageCircle, Share2, Trash2, Download, ExternalLink, User, Star, SendHorizontal } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { deletePost } from "@/app/actions/adminActions";
import { toggleLike, addComment, submitRating } from "@/app/actions/interactionActions";

export interface PostProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  title: string;
  content: string;
  banner?: string | null;
  video?: string | null;
  ownerName?: string | null;
  externalLink?: string | null;
  fileUrl?: string | null;
  imageSize?: string;
  isSpoiler?: boolean;
  likes: number;
  hasLiked?: boolean;
  comments: { id: string, text: string, authorName: string, authorAvatar: string, timestamp: string }[];
  ratings?: number[];
  userRating?: number;
  timestamp: string;
}

const parseTitleWithEmojis = (text: string) => {
  if(!text) return null;
  const emojiMap: Record<string, string> = {
    ":dc:": "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    ":fire:": "🔥", 
    ":skull:": "💀",
    ":reaper:": "☠️",
    ":verified:": "🛡️"
  };

  const parts = text.split(/(:[a-zA-Z0-9_]+:)/g);
  return parts.map((part, i) => {
    const lowerPart = part.toLowerCase();
    if (emojiMap[lowerPart]) {
      const isUrl = emojiMap[lowerPart].startsWith("http");
      if(isUrl) return <img key={i} src={emojiMap[lowerPart]} alt={part} style={{ width: '28px', height: '28px', verticalAlign: 'middle', display: 'inline-block', margin: '0 4px', filter: 'drop-shadow(0 0 5px rgba(88,101,242,0.8))' }} />;
      return <span key={i}>{emojiMap[lowerPart]}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function Post({ post, channelId, isAdmin }: { post: PostProps, channelId?: string, isAdmin?: boolean }) {
  const [liked, setLiked] = useState(post.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isRevealed, setIsRevealed] = useState(!post.isSpoiler);
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    if(channelId) {
       await toggleLike(post.id, channelId);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newComment.trim() || !channelId) return;
    const txt = newComment;
    setNewComment("");
    startTransition(async () => {
       await addComment(post.id, channelId, txt);
    });
  };

  const currentRatingAvg = post.ratings?.length 
     ? (post.ratings.reduce((a,b)=>a+b,0) / post.ratings.length).toFixed(1) 
     : "0.0";
  
  const handleRate = async (stars: number) => {
      if(!channelId) return;
      await submitRating(post.id, channelId, stars);
  };

  const handleDelete = async () => {
    if(confirm("Deseja apagar esse arquivo permanentemente?")) {
        await deletePost(post.id, channelId || "");
    }
  }

  const getImageWidth = () => {
     if(post.imageSize === "pequena") return "250px";
     if(post.imageSize === "grande") return "100%";
     return "600px"; // Normal
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ overflow: 'hidden' }}
      className="glass-panel"
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="avatar-glow">
              <img src={post.author.avatar} alt={post.author.name} style={{ width: '50px', height: '50px' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{post.author.name}</h4>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>@{post.author.handle} • {post.timestamp}</span>
            </div>
          </div>
          {isAdmin && (
            <button onClick={handleDelete} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }} title="Apagar Post">
              <Trash2 size={20} className="hover-red" />
            </button>
          )}
        </div>

        {/* Title */}
        <h2 className="brand-font text-gradient-purple" style={{ fontSize: '2rem', marginBottom: '16px', lineHeight: 1.2 }}>
            {parseTitleWithEmojis(post.title)}
        </h2>

        {/* Tags Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            {post.ownerName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <User size={14} color="var(--accent-purple-light)" /> Criador: <span style={{ color: 'var(--text-primary)' }}>{post.ownerName}</span>
                </div>
            )}
            {post.externalLink && (
                <a href={post.externalLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.4)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#5865F2', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,101,242,0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(88,101,242,0.1)'}>
                      <ExternalLink size={14} /> Fonte Externa
                  </div>
                </a>
            )}
        </div>

        {/* Content */}
        <p style={{ margin: '0 0 24px 0', lineHeight: 1.6, fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          {post.content}
        </p>

        {/* Media Box */}
        {(post.banner || post.video || post.fileUrl) && (
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                
                <div style={{ position: 'relative', filter: isRevealed ? 'none' : 'blur(20px) grayscale(80%)', transition: 'filter 0.5s ease', cursor: isRevealed ? 'default' : 'pointer' }} onClick={() => !isRevealed && setIsRevealed(true)}>
                  {!isRevealed && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, background: 'rgba(138, 31, 36, 0.8)', padding: '8px 16px', borderRadius: '24px', fontWeight: 'bold', color: 'white' }}>
                          SPOILER (CLIQUE PARA VER)
                      </div>
                  )}
                  {post.banner && (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                         <img src={post.banner} alt="Banner" style={{ width: '100%', maxWidth: getImageWidth(), borderRadius: '8px', marginBottom: post.video ? '16px' : '0', display: 'block' }} />
                      </div>
                  )}

                  {post.video && (
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                         <div style={{ width: '100%', maxWidth: getImageWidth() }}>
                            <VideoPlayer src={post.video} />
                         </div>
                      </div>
                  )}
                </div>

                {post.fileUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(138, 31, 36, 0.05)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>Arquivo Anexado</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download liberado para membros verificados.</p>
                        </div>
                        <a href={post.fileUrl} download="Reaper_Community_File" style={{ textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Download size={18} /> BAIXAR DADOS
                            </button>
                        </a>
                    </div>
                )}
            </div>
        )}

        {/* Interaction Metrics / Rating Display Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Heart size={14} color="var(--accent-red)" /> {likesCount} Curtidas
                 </span>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <MessageCircle size={14} color="var(--accent-purple-light)" /> {post.comments.length} Comentários
                 </span>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          size={16} 
                          color={post.userRating && star <= post.userRating ? "var(--accent-purple-light)" : "var(--text-muted)"} 
                          fill={post.userRating && star <= post.userRating ? "var(--accent-purple-light)" : "transparent"} 
                          style={{ cursor: channelId ? 'pointer' : 'default' }}
                          onClick={() => channelId && handleRate(star)}
                        />
                     ))}
                     <span style={{ marginLeft: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentRatingAvg}</span>
                 </div>
                 <span style={{ fontSize: '0.75rem' }}>{post.ratings?.length || 0} Avaliações</span>
             </div>
        </div>

        {/* Actions Menu */}
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
          
          <button onClick={handleToggleLike} className="action-btn" style={{ color: liked ? 'var(--accent-red)' : '' }}>
             <Heart fill={liked ? 'var(--accent-red)' : 'transparent'} color={liked ? 'var(--accent-red)' : 'currentColor'} size={22} className={liked ? 'animate-fade-in' : ''} />
             <span style={{ textShadow: liked ? 'var(--glow-red)' : 'none', fontSize: '1.1rem' }}>Reagir</span>
          </button>

          <button onClick={() => setShowComments(!showComments)} className="action-btn">
             <MessageCircle size={22} color={showComments ? 'var(--accent-purple-light)' : 'currentColor'} />
             <span style={{ fontSize: '1.1rem' }}>Comentar</span>
          </button>

          <button className="action-btn">
             <Share2 size={22} />
             <span style={{ fontSize: '1.1rem' }}>Copiar</span>
          </button>

        </div>

        {/* Real Comments Section */}
        <AnimatePresence>
          {showComments && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                 <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                     <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                         <input type="text" placeholder="Deixe um comentário público..." value={newComment} onChange={e => setNewComment(e.target.value)} disabled={isPending || !channelId} className="input-field" style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }} />
                         <button type="submit" className="btn-secondary" disabled={isPending || !newComment.trim() || !channelId} style={{ padding: '0 24px' }}>
                            <SendHorizontal size={18} />
                         </button>
                     </form>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                         {post.comments.length === 0 ? (
                             <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seja o primeiro a iniciar a discussão.</p>
                         ) : (
                             post.comments.map(c => (
                                <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                    <img src={c.authorAvatar} alt={c.authorName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '0 12px 12px 12px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.authorName}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.timestamp}</span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', wordBreak: 'break-word' }}>{c.text}</p>
                                    </div>
                                </div>
                             ))
                         )}
                     </div>
                 </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
