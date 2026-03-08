"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket as TicketIcon, Send, Archive, MessageSquare } from "lucide-react";
import { createTicket, addTicketMessage, closeTicket } from "@/app/actions/ticketActions";

export default function TicketPanel({ user, tickets, isStaff }: { user: any, tickets: any[], isStaff: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if(!reason.trim()) return;
    const r = reason;
    setReason("");
    setIsOpen(false);
    startTransition(async () => {
       await createTicket(r);
    });
  };

  const handleMessage = (e: React.FormEvent, tkId: string) => {
    e.preventDefault();
    if(!message.trim()) return;
    const m = message;
    setMessage("");
    startTransition(async () => {
       await addTicketMessage(tkId, m);
    });
  };

  const handleClose = async (tkId: string) => {
    if(confirm("Deseja fechar esse ticket?")) {
        await closeTicket(tkId);
        setActiveTicket(null);
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="brand-font" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple-light)' }}>
             <MessageSquare size={24} /> 
             {isStaff ? "PAINEL DE SUPORTE STAFF" : "MEUS TICKETS E SUPORTE"}
          </h3>
          
          {!isStaff && (
              <button onClick={() => setIsOpen(!isOpen)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                 <TicketIcon size={18} /> ABRIR TICKET
              </button>
          )}
       </div>

       <AnimatePresence>
          {isOpen && !isStaff && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                 <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Seu Nome</label>
                        <input type="text" value={user.name} disabled className="input-field" style={{ opacity: 0.7 }} />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>Escreva sua Reclamação/Dúvida</label>
                        <textarea placeholder="Detalhe seu problema aqui..." value={reason} onChange={e => setReason(e.target.value)} rows={4} className="input-field" required></textarea>
                     </div>
                     <button type="submit" disabled={isPending || !reason.trim()} className="btn-primary" style={{ alignSelf: 'flex-start' }}>{isPending ? "ENVIANDO..." : "ENVIAR TICKET"}</button>
                 </form>
             </motion.div>
          )}
       </AnimatePresence>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tickets.length === 0 ? (
             <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Nenhum ticket aberto no momento.</p>
          ) : (
             tickets.map(tk => (
                <div key={tk.id} style={{ border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', background: tk.status === 'CLOSED' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTicket(activeTicket === tk.id ? null : tk.id)}>
                        <div>
                            <span style={{ color: tk.status === 'OPEN' ? '#00ff00' : 'var(--text-muted)', fontWeight: 'bold', marginRight: '12px' }}>● {tk.status === 'OPEN' ? "ABERTO" : "FECHADO"}</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{tk.user.name}</strong>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.9rem' }}>- {tk.reason.length > 30 ? tk.reason.substring(0,30)+"..." : tk.reason}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(tk.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <AnimatePresence>
                        {activeTicket === tk.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                
                                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <p style={{ margin: 0, color: 'var(--text-primary)' }}><strong>Reclamação Original:</strong> {tk.reason}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {tk.messages.map((m: any) => (
                                        <div key={m.id} style={{ alignSelf: m.isStaff ? 'flex-start' : 'flex-end', background: m.isStaff ? 'rgba(138, 31, 36, 0.2)' : 'rgba(63, 26, 99, 0.2)', border: '1px solid', borderColor: m.isStaff ? 'rgba(138, 31, 36, 0.4)' : 'rgba(63, 26, 99, 0.4)', padding: '12px 16px', borderRadius: '12px', maxWidth: '80%' }}>
                                            <div style={{ fontSize: '0.8rem', color: m.isStaff ? 'var(--accent-red)' : 'var(--accent-purple-light)', marginBottom: '4px', fontWeight: 'bold' }}>
                                                {m.user.name} {m.isStaff && "(STAFF)"} • {new Date(m.createdAt).toLocaleTimeString('pt-BR')}
                                            </div>
                                            <div style={{ color: 'var(--text-primary)' }}>{m.text}</div>
                                        </div>
                                    ))}
                                </div>

                                {tk.status === 'OPEN' && (
                                   <form onSubmit={(e) => handleMessage(e, tk.id)} style={{ display: 'flex', gap: '8px' }}>
                                       <input type="text" placeholder={isStaff ? "Responder como Staff..." : "Enviar mensagem..."} value={message} onChange={e => setMessage(e.target.value)} disabled={isPending} className="input-field" style={{ flex: 1, padding: '12px' }} />
                                       <button type="submit" disabled={isPending || !message.trim()} className="btn-primary" style={{ padding: '0 24px' }}>
                                          <Send size={18} />
                                       </button>
                                       <button type="button" onClick={() => handleClose(tk.id)} className="btn-secondary" title="Fechar Ticket" style={{ padding: '0 16px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                                          <Archive size={18} />
                                       </button>
                                   </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
             ))
          )}
       </div>
    </div>
  );
}
