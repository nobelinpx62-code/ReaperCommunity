"use client";

import { useState } from "react";
import { Image as ImageIcon, Video, Send, FileCode, Link as LinkIcon, User, Eye, Plus, Layout, ShieldAlert } from "lucide-react";
import { createPost } from "@/app/actions/adminActions";
import { motion, AnimatePresence } from "framer-motion";
import Post from "./Post";

export default function CreatePost({ user, channelId }: { user: any, channelId: string }) {
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [banner, setBanner] = useState("");
  const [video, setVideo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  
  const [imageSize, setImageSize] = useState("normal");
  const [isSpoiler, setIsSpoiler] = useState(false);
  
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setFileUrl(reader.result as string);
         alert("Arquivo base64 gerado com sucesso para anexar ao post.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setBanner(reader.result as string);
         alert("Imagem baseada importada! Veja na prévia.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setVideo(reader.result as string);
         alert("Vídeo importado para Database.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    try {
      await createPost({
         channelId,
         title: title.trim(),
         content: content.trim(),
         banner: banner.trim() || undefined,
         video: video.trim() || undefined,
         ownerName: ownerName.trim() || undefined,
         externalLink: externalLink.trim() || undefined,
         fileUrl: fileUrl.trim() || undefined,
         imageSize,
         isSpoiler
      });
      setTitle("");
      setContent("");
      setBanner("");
      setVideo("");
      setOwnerName("");
      setExternalLink("");
      setFileUrl("");
      setImageSize("normal");
      setIsSpoiler(false);
      setAdvancedOpen(false);
      setIsCreating(false);
    } catch (err) {
      alert("Erro ao publicar post.");
    } finally {
      setPosting(false);
    }
  };

  if (!isCreating) {
    return (
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
         <button className="btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '1.2rem', width: '100%', justifyContent: 'center' }}>
            <Plus size={24} /> FAZER NOVA POSTAGEM
         </button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px', position: 'relative', overflow: 'hidden', border: '1px solid var(--accent-red)' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-red)' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div className="avatar-glow">
                <img src={user?.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop"} alt="Admin" style={{ width: '48px', height: '48px' }} />
             </div>
             <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Postando como Root</p>
                <p className="brand-font" style={{ color: 'var(--text-primary)', margin: 0 }}>The Reaper</p>
             </div>
           </div>
           <button type="button" onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '2rem' }}>&times;</button>
        </div>

        <input 
          placeholder="TÍTULO DO POST (Use emojis como :fire: ou :dc:)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="input-field" 
          disabled={posting}
          required 
          style={{ fontSize: '1.2rem', padding: '16px' }}
        />

        <textarea 
          placeholder="Escreva a essência do post aqui... As regras do hype se aplicam."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field"
          required
          disabled={posting}
          style={{ minHeight: '120px' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
           <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              {advancedOpen ? "- Ocultar Campos Avançados" : "+ Mídia, Anexos e Links"}
           </button>
        </div>

        <AnimatePresence>
          {advancedOpen && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }} 
               exit={{ opacity: 0, height: 0 }}
               style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}
            >
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <ImageIcon size={18} color="var(--accent-purple-light)" />
                 <input placeholder="URL da Capa ou Importe 👉" value={banner} onChange={e => setBanner(e.target.value)} className="input-field" style={{ flex: 1, padding: '10px' }} />
                 <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '10px' }}>Importar</button>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, right: 0, minWidth: '100%', minHeight: '100%', opacity: 0, cursor: 'pointer' }} />
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px' }}>
                 <Layout size={18} color="var(--text-secondary)" />
                 <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Tamanho da Imagem:</span>
                 <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="input-field" style={{ padding: '8px', flex: 1 }}>
                    <option value="pequena">Pequena</option>
                    <option value="normal">Normal</option>
                    <option value="grande">Super (Tela Cheia)</option>
                 </select>
               </div>

               <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px' }}>
                 <ShieldAlert size={18} color={isSpoiler ? "var(--accent-red)" : "var(--text-secondary)"} />
                 <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1 }}>Marcar Imagem/Vídeo como Spoiler (Borrado)?</span>
                 <button type="button" onClick={() => setIsSpoiler(!isSpoiler)} className={isSpoiler ? "btn-primary" : "btn-secondary"} style={{ padding: '8px 16px' }}>
                    {isSpoiler ? "ATIVADO" : "DESATIVADO"}
                 </button>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <Video size={18} color="var(--accent-purple-light)" />
                 <input placeholder="URL do Vídeo Mp4 ou Importe 👉" value={video} onChange={e => setVideo(e.target.value)} className="input-field" style={{ flex: 1, padding: '10px' }} />
                 <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '10px' }}>Importar</button>
                    <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} style={{ position: 'absolute', top: 0, right: 0, minWidth: '100%', minHeight: '100%', opacity: 0, cursor: 'pointer' }} />
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <User size={18} color="var(--text-secondary)" />
                 <input placeholder="Nome do Dono do Arquivo (Ex: zKirlan)" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="input-field" style={{ flex: 1, padding: '10px' }} />
               </div>
               
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <LinkIcon size={18} color="var(--text-secondary)" />
                 <input placeholder="Link Externo Adicional (Site/Referência)" value={externalLink} onChange={e => setExternalLink(e.target.value)} className="input-field" style={{ flex: 1, padding: '10px' }} />
               </div>

               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <FileCode size={18} color="var(--accent-red)" />
                 <input placeholder="URL de Download Direto ou Base64" value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="input-field" style={{ flex: 1, padding: '10px' }} />
                 <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '10px' }}>Upload Local</button>
                    <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, right: 0, minWidth: '100%', minHeight: '100%', opacity: 0, cursor: 'pointer' }} />
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <button type="submit" className="btn-primary" disabled={!title.trim() || !content.trim() || posting} style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: posting ? 0.5 : 1 }}>
            <Send size={18} />
            {posting ? "ENVIANDO AO REAPER..." : "PUBLICAR HIPER-POST"}
          </button>
        </div>
      </form>

      {/* Live Preview Console */}
      {(title || content || banner || video || fileUrl || externalLink) && (
        <div style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
             <h3 className="brand-font" style={{ color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="var(--accent-red)" /> PRÉVIA AO VIVO DA RENDERIZAÇÃO
             </h3>
             <div style={{ opacity: 0.8, pointerEvents: 'none' }}>
               <Post 
                  post={{
                    id: 'preview-id',
                    author: {
                        name: 'The Reaper',
                        handle: 'admin_root',
                        avatar: user?.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop"
                    },
                    title: title || 'Título...',
                    content: content || 'O texto vai aparecer aqui...',
                    banner: banner || null,
                    video: video || null,
                    ownerName: ownerName || null,
                    externalLink: externalLink || null,
                    fileUrl: fileUrl || null,
                    imageSize: imageSize,
                    isSpoiler: isSpoiler,
                    likes: 0,
                    hasLiked: false,
                    comments: [],
                    ratings: [],
                    userRating: 0,
                    timestamp: 'Agora mesmo'
                  }}
                  isAdmin={false}
               />
             </div>
        </div>
      )}
    </div>
  );
}
