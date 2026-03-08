"use client";

import Link from "next/link";
import { loginAction, logoutAction } from "@/app/actions/authActions";

export default function Header({ session }: { session: any }) {
  return (
    <header className="glass-panel" style={{ 
      margin: '20px 24px', 
      padding: '16px 32px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      zIndex: 50, 
      position: 'relative' 
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className="brand-font text-gradient-red" style={{ margin: 0, fontSize: '2rem' }}>REAPER</h1>
        <h4 className="brand-font text-gradient-purple" style={{ margin: 0, fontSize: '0.9rem', marginTop: '-5px' }}>COMMUNITY SERVER</h4>
      </Link>

      <div>
        {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {session.user?.image && (
                      <div className="avatar-glow">
                        <img src={session.user.image} alt="Avatar" style={{ width: '40px', height: '40px' }} />
                      </div>
                    )}
                    <span style={{ fontWeight: 600 }}>{session.user?.name}</span>
                </div>
                <form action={logoutAction}>
                    <button className="btn-secondary">Logout</button>
                </form>
            </div>
        ) : (
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
               ACESSO RESTRITO
            </div>
        )}
      </div>
    </header>
  );
}
