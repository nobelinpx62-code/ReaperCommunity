"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus, Key, ShieldAlert } from "lucide-react";
import { promoteToStaff, demoteToUser, generateToken } from "@/app/actions/adminPanelActions";

export default function AdminPanel({ users, isRealAdmin }: { users: any[], isRealAdmin: boolean }) {
  const [promoteInput, setPromoteInput] = useState("");
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  if (!isRealAdmin) return null;

  const handlePromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteInput.trim()) return;
    const input = promoteInput;
    setPromoteInput("");
    startTransition(async () => {
       const res = await promoteToStaff(input);
       if (res?.error) {
           alert(res.error);
       } else {
           alert(`Membro promovido para STAFF com sucesso!`);
       }
    });
  };

  const handleDemote = (userId: string) => {
    if (confirm("Remover cargo de STAFF?")) {
        startTransition(async () => {
           await demoteToUser(userId);
           alert("Cargo removido.");
        });
    }
  };

  const handleGenerateToken = async () => {
      const token = await generateToken();
      setGeneratedTokens([token, ...generatedTokens]);
  };

  const ADMIN_IDS = ["1144048134109003816", "1313535117792378891"];

  const staffMembers = users.filter(u => u.role === "STAFF" || u.role === "ADMIN" || ADMIN_IDS.includes(u.accounts?.[0]?.providerAccountId));

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--accent-red)' }}>
       <h3 className="brand-font" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', marginBottom: '16px' }}>
          <ShieldAlert size={24} /> CONFIGURAÇÕES ROOT / ADMINISTRAÇÃO
       </h3>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Staff Configuration */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
             <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                Gerenciar Equipe STAFF 
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{staffMembers.length} STAFFS</span>
             </h4>

             <form onSubmit={handlePromote} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                 <input type="text" placeholder="Nome, E-mail ou ID do Discord" value={promoteInput} onChange={e => setPromoteInput(e.target.value)} className="input-field" required style={{ flex: 1, padding: '10px' }} />
                 <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: '0 16px' }}>
                     <UserPlus size={18} />
                 </button>
             </form>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                 {staffMembers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum staff cadastrado.</p>
                 ) : (
                    staffMembers.map(staff => (
                        <div key={staff.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <img src={staff.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&auto=format&fit=crop"} alt={staff.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                 <span style={{ color: 'var(--accent-purple-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>{staff.name}</span>
                             </div>
                             <button onClick={() => handleDemote(staff.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Remover Staff">
                                 <UserMinus size={16} className="hover-red" />
                             </button>
                        </div>
                    ))
                 )}
             </div>
          </div>

          {/* Token Generation */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
             <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                Gerador de Tokens (Convite)
             </h4>
             <button onClick={handleGenerateToken} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', padding: '12px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                <Key size={18} /> GERAR NOVO TOKEN MASTER
             </button>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                 {generatedTokens.map((t, i) => (
                    <div key={i} style={{ background: 'rgba(138, 31, 36, 0.1)', border: '1px solid rgba(138, 31, 36, 0.4)', padding: '8px 12px', borderRadius: '8px', color: 'white', fontFamily: 'monospace', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {t}
                        <button onClick={() => { navigator.clipboard.writeText(t); alert("Token copiado!"); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple-light)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            COPIAR
                        </button>
                    </div>
                 ))}
             </div>
          </div>
       </div>
    </div>
  );
}
